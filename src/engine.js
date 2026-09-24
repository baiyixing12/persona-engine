/**
 * 人格引擎 · 核心状态机
 *
 * 这套算法骨架来自「希言认知 v4」（→ 小凌认知 → 更早的原始模型），
 * 改造要点只有一个：**所有原本写死的角色专属内容，改成从 profile 读**。
 *
 *   v4 里写死的           →  现在从哪读
 *   ─────────────────────────────────────────────
 *   CFG.feel.event_valence_impact  →  profile.feel.event_valence_impact
 *   CFG.person.*_delta             →  profile.person.*_delta
 *   台词数组 R{}                    →  profile.lines[key]
 *   注入头/尾 '【希言·内心】'        →  profile.inject.header / footer
 *   事件正则 EP[]                   →  profile.events[]（含 regex 字符串）
 *   目标文案 M{} / 信念文案 M{}      →  profile.goals{} / profile.beliefs{}
 *   情绪词 vd/ad/sd                →  profile.labels.*
 *
 * 结构本身（af 七维、记忆→模式→信念、需求→目标→决策→表态、遗忘衰减）
 * 一行没动 —— 因为它是通用的，只有「值」曾经是专属的。
 */

import { resolveProfile } from './config.js';

/* ---------- 小工具（沿用 v4） ---------- */
export const clip01 = (v) => Math.max(0, Math.min(1, v));
export const clip11 = (v) => Math.max(-1, Math.min(1, v));
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/** 插值：把 {{char}} / {{user}} 换掉 */
function tpl(s, ctx) {
  if (typeof s !== 'string') return s;
  return s
    .replace(/\{\{char\}\}/g, ctx.char || '她')
    .replace(/\{\{user\}\}/g, ctx.user || '你');
}

/* ---------- 事件检测：正则来自 profile ---------- */
function buildEvents(profile) {
  const out = [];
  for (const e of profile.events || []) {
    if (!e || !e.id || !e.pattern) continue;
    let re;
    try {
      re = new RegExp(e.pattern);
    } catch (err) {
      continue; // 卡里写错正则不能让整个引擎挂掉
    }
    out.push({ t: e.id, re, z: typeof e.z === 'number' ? e.z : 0.7, effect: e.effect || {} });
  }
  return out;
}

export function detect(txt, events) {
  const s = (txt || '').trim().slice(-600);
  const hits = [];
  for (const e of events) {
    const m = s.match(e.re);
    if (m) hits.push({ t: e.t, z: e.z, p: m[0], effect: e.effect });
  }
  if (!hits.length) return { t: 'neutral', z: 0.3, p: '', effect: {} };
  hits.sort((a, b) => b.z - a.z || b.p.length - a.p.length);
  return hits[0];
}

export function estParams(txt, ev) {
  const s = txt || '';
  const sev = clip01((ev.z || 0.5) * (1 + Math.min(s.length, 200) / 400));
  const nov = clip01(1 - Math.exp(-s.length / 160));
  return { sev, nov };
}

/* ---------- 直觉层：对「某人 + 某类事件」的好恶 ---------- */
export class Intuition {
  constructor(cfg) {
    this.cfg = cfg;
    this.s = {};
  }
  key(ev, who) {
    return (ev || 'neutral') + '@' + (who || '?');
  }
  get(ev, who) {
    const k = this.key(ev, who);
    if (!this.s[k]) this.s[k] = { s: 0, f: 0, n: 0 };
    return this.s[k];
  }
  feel(ev, who, reactionDelta) {
    const st = this.get(ev, who);
    const c = this.cfg;
    st.s = clip11(st.s * (1 - c.learning_rate) + c.learning_rate * (reactionDelta + c.approach_bias * (reactionDelta > 0 ? 1 : 0)));
    st.n++;
    st.f = clip01(Math.min(c.confidence_cap || 0.95, st.f + c.confidence_growth * (st.n > 1 ? 1 : 0.5)));
    return st;
  }
  decay() {
    const c = this.cfg;
    for (const k in this.s) {
      this.s[k].s = clip11(this.s[k].s * (1 - c.decay));
      this.s[k].f = clip01(this.s[k].f * (1 - c.decay * 0.5));
    }
  }
  bias(ev, who) {
    const st = this.get(ev, who);
    return clip11(st.s * (st.f || 0) * (this.cfg.approach_bias || 0.3));
  }
  dump() {
    return JSON.parse(JSON.stringify(this.s));
  }
  load(o) {
    this.s = o && typeof o === 'object' ? o : {};
  }
}

/* ---------- 主引擎 ---------- */
export class PersonaEngine {
  /**
   * @param {string} cid 会话标识（每个聊天独立一份人格状态）
   * @param {object} profile 已解析好的 profile（见 config.resolveProfile）
   * @param {{name?:string}} [meta] 角色名等运行时信息
   */
  constructor(cid, profile, meta) {
    this.cid = cid || 'default';
    this.profile = profile;
    this.meta = meta || {};
    this.cfg = profile.cfg || {};
    this.events = buildEvents(profile);
    this.schema = profile.variables || {};
    this.intuition = new Intuition(
      Object.assign({}, this.cfg.intuition, {
        confidence_cap: this.cfg.confidence_cap,
        confidence_growth: this.cfg.confidence_growth
      })
    );
    this.ep = 0;
    this.lastEvent = null;
    this.reset();
  }

  get key() {
    return 'persona_engine_state_' + this.cid;
  }

  /* 注入与生成时用到的插值上下文 */
  get tctx() {
    return { char: this.meta.name || this.profile.meta?.name || '她', user: this.meta.user || '你' };
  }

  reset() {
    this.af = { v: 0.05, a: 0.25, s: 0.35, u: 0.4, c: 0.2, ct: 0.3, bc: 0.3 };
    this.self = { esteem: 0.3, efficacy: 0.3, coherence: 0.5 };
    this.memories = [];
    this.beliefs = [];
    this.patterns = [];
    this.goals = [];
    this.persons = {};
    this.history = [];
    this.intuition.load({});
    this.ep = 0;
    this.lastEvent = null;
    this._dec = null;
    this._act0 = null;
    this._save();
  }

  /* ---- 持久化：优先走酒馆助手脚本变量，退化到 localStorage ---- */
  _storeRead() {
    try {
      const TH = globalThis.TavernHelper;
      if (TH && typeof TH.getVariables === 'function') {
        const v = TH.getVariables({ type: 'script' });
        if (v && v[this.key]) return v[this.key];
      }
    } catch (e) {}
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.key);
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {}
    return null;
  }
  _storeWrite(obj) {
    try {
      const TH = globalThis.TavernHelper;
      if (TH && typeof TH.insertOrAssignVariables === 'function') {
        TH.insertOrAssignVariables({ [this.key]: obj }, { type: 'script' });
        return;
      }
    } catch (e) {}
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(this.key, JSON.stringify(obj));
    } catch (e) {}
  }

  _load() {
    try {
      const o = this._storeRead();
      if (o) {
        Object.assign(this, {
          af: o.af || this.af,
          self: o.self || this.self,
          memories: o.memories || [],
          beliefs: o.beliefs || [],
          patterns: o.patterns || [],
          goals: o.goals || [],
          persons: o.persons || {},
          history: o.history || [],
          ep: o.ep || 0
        });
        if (o.intuition) this.intuition.load(o.intuition);
      } else this.reset();
    } catch (e) {
      this.reset();
    }
    return this;
  }

  _save() {
    this._storeWrite({
      af: this.af,
      self: this.self,
      memories: this.memories.slice(-80),
      beliefs: this.beliefs,
      patterns: this.patterns,
      goals: this.goals,
      persons: this.persons,
      history: this.history.slice(-40),
      ep: this.ep,
      intuition: this.intuition.dump()
    });
  }

  /* ---- 主循环 ---- */
  evolve(txt, who, whoName, isUser) {
    this.ep++;
    const ev = detect(txt, this.events);
    const p = estParams(txt, ev);
    const prev = { v: this.af.v, c: this.af.c };
    this.lastEvent = ev;
    this._enrich(ev);
    const feel = this._feel(ev, p, who, whoName);
    this.intuition.feel(ev.t, who || '?', feel.dv);
    this._remember(ev, p, txt, whoName);
    this._updateBeliefs(ev, p, txt);
    this._updatePerson(ev, p, who || '?', whoName);
    this._updateSelf(ev, p, feel, isUser);
    this._genGoals(whoName, isUser);
    const dec = this._decide(whoName, isUser);
    const act = this._act(dec, ev, whoName);
    this._decay();
    this.history.push({ ep: this.ep, t: ev.t, m: feel.dv.toFixed(2), who: whoName, txt: (txt || '').slice(0, 40) });
    if (this.history.length > 40) this.history.shift();
    this._save();
    return { ev, feel, dec, act, prev };
  }

  _enrich(ev) {
    this._lastSev = ev.z || 0.5;
    return ev;
  }

  /* ---- 情绪：核心七维的更新，取值全从 profile.feel / profile.effect 表来 ---- */
  _feel(ev, p, who, whoName) {
    const c = this.cfg.feel || {};
    const P = this.profile;
    const vt = P.feel?.event_valence_impact || {};
    const at = P.feel?.event_arousal_impact || {};
    // 卡内 events[].effect 可以逐事件覆盖（比全局表更细）
    const ov = ev.effect || {};
    const baseV = ov.valence !== undefined ? ov.valence : vt[ev.t] !== undefined ? vt[ev.t] : 0;
    const baseA = ov.arousal !== undefined ? ov.arousal : at[ev.t] !== undefined ? at[ev.t] : 0.05;
    const dv = baseV * (0.5 + c.severity_weight * p.sev);
    const da = baseA * (0.5 + p.sev) + c.novelty_arousal_weight * p.nov;
    const inertia = c.inertia;

    this.af.v = clip11(this.af.v * inertia + dv * (1 - inertia + 0.1));
    this.af.a = clip01(this.af.a * inertia + Math.max(0, da) * (1 - inertia + 0.1));

    // 下面这些「哪些事件会推高不确定 / 安全感 / 边界舒适 / 信任」原本是写死的 if，
    // 现在统一读 profile.effect：每个事件可以声明自己碰哪些维度、碰多少。
    const eff = this._effectTable();
    this.af.u = clip01(this.af.u * inertia + (eff.uncertainty[ev.t] || 0) * p.sev * (1 - inertia) * 2);
    this.af.ct = clip01(this.af.ct * 0.7 + (eff.connection[ev.t] !== undefined ? eff.connection[ev.t] : 0.05));
    this.af.s = clip01(this.af.s + (eff.safety[ev.t] || 0) * p.sev);
    this.af.bc = clip01(this.af.bc + (eff.comfort[ev.t] || 0) - 0.02);
    this.af.c = clip01(this.af.c + (c.trust_connection_weight || 0.35) * (eff.trust[ev.t] || 0) + (c.attachment_connection_weight || 0.3) * (eff.attach[ev.t] || 0));
    return { dv, da, sev: p.sev, nov: p.nov };
  }

  /**
   * 把 profile.effect 展开成按维度索引的表。
   * profile.effect = {
   *   uncertainty: { coercion: 0.5, promise_broken: 0.5 },
   *   safety:      { coercion: -1 },
   *   comfort:     { kaf: 0.16 },
   *   trust:       { promise_kept: 0.15, apology: 0.15, repair: 0.15 },
   *   attach:      { being_called_sister: 0.1 },
   *   connect:     { kaf: 0.25, help_offered: 0.25 }
   * }
   */
  _effectTable() {
    const d = this.profile.effect || {};
    return {
      uncertainty: d.uncertainty || {},
      safety: d.safety || {},
      comfort: d.comfort || {},
      trust: d.trust || {},
      attach: d.attach || {},
      connection: d.connection || {}
    };
  }

  /* ---- 记忆 ---- */
  _remember(ev, p, txt, whoName) {
    const c = this.cfg.memory || {};
    const imp = clip01(0.35 * p.sev + (c.emotional_intensity_weight || 0.6) * Math.abs(p.sev) + 0.1);
    if (imp < (c.min_importance || 0.25) && ev.t === 'neutral') return;
    this.memories.push({ id: uid(), t: ev.t, w: whoName || '?', txt: (txt || '').slice(0, 60), imp, sal: clip01(0.5 + p.sev * 0.5), ep: this.ep, age: 0 });
    if (this.memories.length > (c.max_memories || 60) * 1.5) this._patterns();
    return this.memories[this.memories.length - 1];
  }

  _patterns() {
    const c = this.cfg.pattern || {};
    const by = {};
    for (const m of this.memories) {
      const k = m.t + '|' + m.w;
      by[k] = by[k] || { t: m.t, w: m.w, n: 0, imp: 0 };
      by[k].n++;
      by[k].imp += m.imp;
    }
    for (const k in by) {
      const b = by[k];
      if (b.n >= (c.min_pattern_count || 2)) {
        const ex = this.patterns.find((p) => p.t === b.t && p.w === b.w);
        if (ex) {
          ex.n = b.n;
          ex.imp = b.imp / b.n;
        } else this.patterns.push({ t: b.t, w: b.w, n: b.n, imp: b.imp / b.n });
      }
    }
    this.patterns.sort((a, b) => b.imp * b.n - a.imp * a.n);
    if (this.patterns.length > 20) this.patterns = this.patterns.slice(0, 20);
  }

  /** 记忆 → 一句「留在心里的」话，来自 profile.memoryText[事件id] */
  _btext(t, w) {
    const M = this.profile.memoryText || {};
    const s = M[t];
    if (!s) return '';
    return tpl(s, { char: this.tctx.char, user: w || '对方' });
  }

  /* ---- 信念 ---- */
  _updateBeliefs(ev, p) {
    const c = this.cfg.belief || {};
    const map = this.profile.beliefs || {};
    const m = map[ev.t];
    if (!m) return;
    const ex = this.beliefs.find((b) => b.b === m.b);
    if (ex) {
      ex.n = (ex.n || 1) + 1;
      ex.v = clip11((ex.v || 0) * 0.8 + m.v * (0.6 + p.sev * 0.4));
      ex.ep = this.ep;
    } else this.beliefs.push({ b: m.b, v: clip11(m.v), n: 1, ep: this.ep });
    this.beliefs.sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
    if (this.beliefs.length > (c.max_beliefs || 40)) this.beliefs = this.beliefs.slice(0, c.max_beliefs || 40);
  }

  /* ---- 对人的判断 ---- */
  _updatePerson(ev, p, who, whoName) {
    const c = this.cfg.person || {};
    const n = whoName || who || '对方';
    const sup = c.support_events || [];
    const supMul = sup.indexOf(ev.t) >= 0 ? c.support_multiplier || 1.2 : 1.0;
    if (!this.persons[n]) this.persons[n] = { name: n, reliability: 0.5, boundary: 0.5, repair: 0.5, alignment: 0.5, n: 0, last: '', ep: 0 };
    const P = this.persons[n];
    const w = (0.6 + p.sev * 0.6) * supMul;
    const dims = ['reliability', 'boundary', 'repair', 'alignment'];
    for (const d of dims) {
      const table = c[d + '_delta'] || {};
      const v = table[ev.t];
      if (v !== undefined) P[d] = clip01(P[d] + v * w);
    }
    P.n++;
    P.last = ev.t;
    P.ep = this.ep;
  }

  /* ---- 自我模型 ---- */
  _updateSelf(ev, p, feel, isUser) {
    const c = this.cfg.self_model || {};
    const cls = this.profile.selfEffects || {};
    const up = cls.esteem_up || [];
    const down = cls.esteem_down || [];
    const coh = cls.coherence_down || [];
    const gain = c.positive_self_esteem_gain || 0.03;
    const loss = c.negative_self_esteem_loss || 0.05;
    const reg = c.stability_regression || 0.05;
    if (up.indexOf(ev.t) >= 0) {
      this.self.esteem = clip01(this.self.esteem + gain);
      this.self.efficacy = clip01(this.self.efficacy + (c.efficacy_gain || 0.02));
    }
    if (down.indexOf(ev.t) >= 0) this.self.esteem = clip01(this.self.esteem - loss);
    if (coh.indexOf(ev.t) >= 0) this.self.coherence = clip01(this.self.coherence - reg);
    this.self.esteem = clip01(this.self.esteem * (1 - reg * 0.3) + 0.3 * reg * 0.3);
  }

  /* ---- 需求 → 目标 ---- */
  _needs() {
    const b = (this.cfg.goal && this.cfg.goal.need_base_priority) || {};
    const d = (this.cfg.goal && this.cfg.goal.deficit_amplification) || 0.8;
    return {
      safety: clip01((b.safety || 0.5) + (1 - this.af.s) * d * 0.5),
      connection: clip01((b.connection || 0.4) + (1 - this.af.ct) * d * 0.5),
      autonomy: clip01((b.autonomy || 0.4) + (1 - this.af.bc) * d * 0.4 + (1 - this.af.c) * d * 0.2),
      competence: clip01((b.competence || 0.35) + (1 - this.self.efficacy) * d * 0.4),
      predictability: clip01((b.predictability || 0.3) + this.af.u * d * 0.5)
    };
  }

  _best() {
    const N = this._needs();
    let k = null;
    let m = -1;
    for (const x in N)
      if (N[x] > m) {
        m = N[x];
        k = x;
      }
    return { k, m, N };
  }

  _ngoal(k, who) {
    const M = this.profile.goals || {};
    const s = M[k];
    if (!s) return tpl(M.default || '就这样待着', { char: this.tctx.char, user: who || '对方' });
    return tpl(s, { char: this.tctx.char, user: who || '对方' });
  }

  _genGoals(whoName) {
    const c = this.cfg.goal || {};
    const b = this._best();
    const n = whoName || '对方';
    const key = 'goal_' + b.k;
    let g = this.goals.find((x) => x.k === key);
    if (g) {
      g.pri = clip01(g.pri * 0.9 + b.m * 0.1);
      g.ep = this.ep;
    } else this.goals.push({ k: key, pri: clip01(b.m), need: b.k, txt: this._ngoal(b.k, n), ep: this.ep });
    this.goals.sort((a, b2) => b2.pri - a.pri);
    if (this.goals.length > (c.max_active_goals || 4)) this.goals = this.goals.slice(0, c.max_active_goals || 4);
  }

  /* ---- 决策 ---- */
  _decide(whoName) {
    const c = this.cfg.decision || {};
    const b = this._best();
    const n = whoName || '对方';
    const P = this.persons[n] || { reliability: 0.5, boundary: 0.5, repair: 0.5, alignment: 0.5 };
    const intui = this.intuition.bias(this.lastEvent ? this.lastEvent.t : 'neutral', n);
    let app = 0;
    let avoid = 0;
    app += (c.safety_approach_weight || 0.4) * this.af.s;
    app += (c.connection_approach_weight || 0.5) * this.af.ct;
    app += (c.goal_priority_weight || 0.5) * (this.goals[0] ? this.goals[0].pri : 0);
    app += (c.intuition_weight || 0.3) * Math.max(0, intui);
    app += 0.3 * this.af.v + 0.2 * P.reliability;
    avoid += (c.uncertainty_avoid_weight || 0.3) * this.af.u;
    avoid += (c.boundary_avoid_weight || 0.6) * (1 - P.boundary);
    avoid += (c.intuition_weight || 0.3) * Math.min(0, intui);
    avoid += 0.3 * Math.max(0, -this.af.v);
    const aa = clip11(app - avoid);
    let intent = 'observe';
    if (aa > (c.approach_threshold || 0.15)) intent = 'approach';
    else if (aa < (c.avoid_threshold || -0.25)) intent = 'withdraw';
    if (intent === 'withdraw' && this.af.u > 0.7 && P.boundary < 0.4) intent = 'guard';

    const R = this.profile.reasons || {};
    let reason = '';
    if (intent === 'withdraw') reason = tpl(R.withdraw || '先退半步', { char: this.tctx.char, user: n });
    else if (intent === 'approach') reason = tpl(R.approach || '想靠近一点', { char: this.tctx.char, user: n });
    else if (intent === 'guard') reason = tpl(R.guard || '先守着', { char: this.tctx.char, user: n });
    else reason = b.k === 'predictability' ? tpl(R.observe_predictability || '想弄明白', { char: this.tctx.char, user: n }) : tpl(R.observe || '先听着', { char: this.tctx.char, user: n });

    const dec = { aa, app, avoid, intent, reason, goal: b.k, need: b.k, who: n };
    this._dec = dec;
    return dec;
  }

  /* ---- 表态：台词全从 profile.lines 取 ---- */
  _act(dec, ev, whoName) {
    let tone = 'quiet';
    if (dec.aa > 0.22 && dec.aa >= -dec.aa) tone = 'warm';
    else if (dec.aa < -0.22) tone = 'guarded';
    else if (this.af.a > 0.75) tone = 'alert';
    const L = this.profile.lines || {};
    const arr = L[ev && ev.t] || L.default || ['……'];
    const line = tpl(arr[Math.floor(Math.random() * arr.length)], { char: this.tctx.char, user: whoName || '对方' });
    const a = { tone, line, intent: dec.intent || 'observe', aa: dec.aa };
    this._act0 = a;
    return a;
  }

  /* ---- 遗忘与衰减 ---- */
  _decay() {
    const c = this.cfg.memory || {};
    for (const m of this.memories) {
      m.age = (m.age || 0) + 1;
      m.imp = clip01(m.imp - (c.decay_rate || 0.02) * (1 + m.age / 50));
    }
    this.memories = this.memories.filter((m) => m.imp > (c.forget_threshold || 0.05));
    for (const b of this.beliefs) b.v = clip11((b.v || 0) * 0.995);
    for (const g of this.goals) g.pri = clip01(g.pri * 0.98);
    for (let i = 0; i < this.history.length; i++) this.history[i].age = (this.history[i].age || 0) + 1;
    this.intuition.decay();
    this.af.a = clip01(this.af.a * 0.98);
  }

  /* ---- 文本呈现（标签词来自 profile.labels） ---- */
  afText() {
    const a = this.af;
    const L = this.profile.labels || {};
    const vd = pickBand(a.v, L.valence || { warm: 0.25, cold: -0.25 });
    const ad = pickBand(a.a, L.arousal || { tense: 0.65, relaxed: 0.3 });
    const sd = pickBand(a.s, L.safety || { safe: 0.6, unsafe: 0.35 });
    const f = this.profile.afText || {};
    const seg = f.segments || ['心情', '张力', '安全感', '连接', '边界舒适', '不确定'];
    return `${seg[0]}:${vd} ${seg[1]}:${ad} ${seg[2]}:${sd} ${seg[3]}:${a.ct.toFixed(2)} ${seg[4]}:${a.bc.toFixed(2)} ${seg[5]}:${a.u.toFixed(2)}`;
  }

  mood() {
    const a = this.af;
    const rules = (this.profile.mood && this.profile.mood.rules) || [];
    for (const r of rules) {
      if (evalCmp(r, a)) return r.label;
    }
    return (this.profile.mood && this.profile.mood.fallback) || '平静';
  }

  personText() {
    const ps = Object.values(this.persons);
    if (!ps.length) return '';
    const f = (this.profile.personText && this.profile.personText.fields) || ['可信', '边界', '修复', '契合'];
    return ps.map((P) => `${P.name}: ${f[0]}${P.reliability.toFixed(2)} ${f[1]}${P.boundary.toFixed(2)} ${f[2]}${P.repair.toFixed(2)} ${f[3]}${P.alignment.toFixed(2)}`).join('\n');
  }

  allPersons() {
    return Object.values(this.persons);
  }

  goalsText() {
    return this.goals.map((g) => `- ${g.txt} (${g.pri.toFixed(2)})`).join('\n');
  }

  fullState() {
    const dec = this._dec || { intent: 'observe', reason: '', aa: 0 };
    const T = this.profile.stateText || {};
    const L = [];
    L.push(T.title || '【此刻的状态】');
    L.push(this.afText());
    L.push((T.mood_prefix || '心情：') + this.mood());
    L.push((T.intent_prefix || '倾向：') + dec.intent + '（' + dec.reason + '）');
    if (this.goals.length) L.push((T.goals || '此刻想要的：') + '\n' + this.goalsText());
    if (this.memories.length) {
      const top = this.memories.slice(-3).reverse().map((m) => this._btext(m.t, m.w)).filter(Boolean);
      if (top.length) L.push((T.memories || '最近留在心里的：') + '\n' + top.join('\n'));
    }
    if (this.beliefs.length) {
      const bs = this.beliefs.slice(0, 3).map((b) => '“' + b.b + '”');
      L.push((T.beliefs || '根深蒂固的念头：') + '\n' + bs.join('\n'));
    }
    const ps = this.personText();
    if (ps) L.push((T.persons || '对身边人的判断：') + '\n' + ps);
    return L.join('\n');
  }

  /** 注入正文：头/尾/角色名全部来自 profile.inject */
  inject() {
    const d = this.fullState();
    const I = this.profile.inject || {};
    const head = tpl(I.header || '【内心】以下是{{char}}此刻没有说出口的内心状态，只能用来决定语气、动作与反应；不要直接复述。\n', this.tctx);
    const tail = tpl(I.footer || '', this.tctx);
    return head + d + tail;
  }
}

/* 取某个数值落在哪个标签带 */
function pickBand(v, table) {
  const entries = Object.entries(table);
  const hi = entries.filter(([, t]) => typeof t === 'number' && v >= t).sort((a, b) => b[1] - a[1])[0];
  const lo = entries.filter(([, t]) => typeof t === 'number' && v < t).sort((a, b) => a[1] - b[1])[0];
  return (hi && hi[0]) || (lo && lo[0]) || '';
}

/**
 * 求值 mood 规则。规则形如 { label:'低落', cmp:'v < -0.2' }
 * 刻意只支持极简比较式（不 eval 任意代码），避免卡内数据变成注入点。
 */
function evalCmp(r, a) {
  const m = /^\s*([a-z]+)\s*(<=|>=|<|>)\s*(-?\d*\.?\d+)\s*(?:&&\s*([a-z]+)\s*(<=|>=|<|>)\s*(-?\d*\.?\d+))?\s*$/.exec(r.cmp || '');
  if (!m) return false;
  const val = (k) => (typeof a[k] === 'number' ? a[k] : NaN);
  const test = (k, op, n) => {
    const x = val(k);
    if (isNaN(x)) return false;
    if (op === '<') return x < n;
    if (op === '>') return x > n;
    if (op === '<=') return x <= n;
    if (op === '>=') return x >= n;
    return false;
  };
  if (!test(m[1], m[2], parseFloat(m[3]))) return false;
  if (m[4]) return test(m[4], m[5], parseFloat(m[6]));
  return true;
}

/** 工厂：解析 profile 后造一个引擎 */
export function createEngine(cid, opts = {}) {
  const profile = opts.profile || resolveProfile(opts);
  const e = new PersonaEngine(cid, profile, opts.meta || {});
  e._load();
  return e;
}

export default PersonaEngine;
