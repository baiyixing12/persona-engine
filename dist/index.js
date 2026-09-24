// src/defaults.js
var ENGINE_VERSION = "0.2.1";
var DEFAULT_EVENTS = [
  // 注意：`抱` 必须排除「抱歉」，否则任何道歉都会被误判成亲密（中文子串陷阱）。
  { id: "intimate", pattern: "\u62E5\u62B1|(?:\u62B1)(?!\u6B49)|\u7275\u624B|\u9760\u7740|\u8D34\u8FD1|\u4F9D\u504E", z: 0.75, effect: { valence: 0.35, arousal: 0.15 } },
  { id: "praise", pattern: "\u771F\u597D|\u5F88\u68D2|\u5389\u5BB3|\u559C\u6B22\u4F60|\u8C22\u8C22\u4F60|\u8F9B\u82E6\u4E86", z: 0.7, effect: { valence: 0.3, arousal: 0.1 } },
  { id: "comfort", pattern: "\u6CA1\u4E8B\u7684|\u522B\u6015|\u966A\u7740\u4F60|\u6211\u5728\u5462|\u522B\u62C5\u5FC3", z: 0.7, effect: { valence: 0.25, arousal: -0.1 } },
  { id: "apology", pattern: "\u5BF9\u4E0D\u8D77|\u62B1\u6B49|\u662F\u6211\u9519\u4E86|\u6211\u4E0D\u8BE5", z: 0.72, effect: { valence: 0.15, arousal: 0.1 } },
  { id: "promise_kept", pattern: "\u6211\u7B54\u5E94\u8FC7|\u8BF4\u597D\u4E86|\u6211\u505A\u5230\u4E86|\u7B54\u5E94\u4F60\u7684\u4E8B", z: 0.78, effect: { valence: 0.4, arousal: 0.12 } },
  { id: "help_offered", pattern: "\u6211\u5E2E\u4F60|\u9700\u8981\u6211|\u4EA4\u7ED9\u6211|\u6211\u6765\u5427", z: 0.72, effect: { valence: 0.28, arousal: 0.1 } },
  { id: "reject", pattern: "\u522B\u78B0|\u8D70\u5F00|\u538C\u70E6|\u8BA8\u538C|\u522B\u70E6\u6211", z: 0.78, effect: { valence: -0.4, arousal: 0.35 } },
  { id: "threat", pattern: "\u5A01\u80C1|\u8B66\u544A|\u4F60\u6700\u597D|\u6562\u8BD5\u8BD5|\u540E\u679C", z: 0.85, effect: { valence: -0.5, arousal: 0.5 } },
  { id: "coercion", pattern: "\u5FC5\u987B|\u4E0D\u8BB8|\u4F60\u5F97\u542C\u6211\u7684|\u6CA1\u6709\u9009\u62E9|\u7531\u4E0D\u5F97\u4F60", z: 0.85, effect: { valence: -0.55, arousal: 0.5 } },
  { id: "promise_broken", pattern: "\u6211\u9A97\u4E86\u4F60|\u9A97\u4F60\u7684|\u6CA1\u5151\u73B0|\u98DF\u8A00|\u5FD8\u4E86\u7B54\u5E94", z: 0.8, effect: { valence: -0.45, arousal: 0.35 } },
  { id: "retreat", pattern: "\u7B97\u4E86|\u968F\u4FBF\u5427|\u4E0D\u60F3\u8BF4|\u522B\u95EE\u4E86|\u6CA1\u4EC0\u4E48", z: 0.68, effect: { valence: -0.2, arousal: -0.15 } }
];
var DEFAULT_PROFILE = {
  meta: {
    name: "\u901A\u7528\u4EBA\u683C",
    version: ENGINE_VERSION
  },
  /* ---------- 事件表（engine.js 读 profile.events；缺了它整张表作废） ---------- */
  events: DEFAULT_EVENTS,
  /* ---------- 各子系统系数 ---------- */
  cfg: {
    confidence_cap: 0.95,
    confidence_growth: 0.06,
    feel: {
      severity_weight: 0.5,
      novelty_arousal_weight: 0.3,
      inertia: 0.8,
      trust_connection_weight: 0.35,
      attachment_connection_weight: 0.3
    },
    intuition: {
      learning_rate: 0.25,
      approach_bias: 0.3,
      decay: 0.02
    },
    memory: {
      emotional_intensity_weight: 0.6,
      min_importance: 0.25,
      max_memories: 60,
      decay_rate: 0.02,
      forget_threshold: 0.05
    },
    pattern: { min_pattern_count: 2 },
    belief: { max_beliefs: 40 },
    person: {
      support_events: ["promise_kept", "comfort", "help_offered", "apology"],
      support_multiplier: 1.2,
      reliability_delta: { promise_kept: 0.18, help_offered: 0.12, apology: 0.08, promise_broken: -0.2, coercion: -0.15 },
      boundary_delta: { intimate: 0.1, coercion: -0.2, threat: -0.15, reject: -0.08 },
      repair_delta: { apology: 0.2, comfort: 0.08, promise_broken: -0.12 },
      alignment_delta: { praise: 0.06, comfort: 0.06, reject: -0.05, threat: -0.08 }
    },
    self_model: {
      positive_self_esteem_gain: 0.03,
      negative_self_esteem_loss: 0.05,
      stability_regression: 0.05,
      efficacy_gain: 0.02
    },
    goal: {
      need_base_priority: { safety: 0.5, connection: 0.4, autonomy: 0.4, competence: 0.35, predictability: 0.3 },
      deficit_amplification: 0.8,
      max_active_goals: 4
    },
    decision: {
      safety_approach_weight: 0.4,
      connection_approach_weight: 0.5,
      goal_priority_weight: 0.5,
      intuition_weight: 0.3,
      uncertainty_avoid_weight: 0.3,
      boundary_avoid_weight: 0.6,
      approach_threshold: 0.15,
      avoid_threshold: -0.25
    }
  },
  /* ---------- 数值分带词（afText 用） ---------- */
  labels: {
    valence: { warm: 0.25, cold: -0.25 },
    arousal: { tense: 0.65, relaxed: 0.3 },
    safety: { safe: 0.6, unsafe: 0.35 }
  },
  /* ---------- 事件 → 情绪基准 ---------- */
  feel: {
    event_valence_impact: {
      intimate: 0.35,
      praise: 0.3,
      comfort: 0.25,
      apology: 0.15,
      promise_kept: 0.4,
      help_offered: 0.28,
      reject: -0.4,
      threat: -0.5,
      coercion: -0.55,
      promise_broken: -0.45,
      retreat: -0.2
    },
    event_arousal_impact: {
      intimate: 0.15,
      praise: 0.1,
      comfort: -0.1,
      apology: 0.1,
      promise_kept: 0.12,
      help_offered: 0.1,
      reject: 0.35,
      threat: 0.5,
      coercion: 0.5,
      promise_broken: 0.35,
      retreat: -0.15
    }
  },
  /* ---------- 事件 → 各维度增量 ---------- */
  effect: {
    uncertainty: { coercion: 0.5, promise_broken: 0.45, threat: 0.35, retreat: 0.2 },
    safety: { coercion: -1, threat: -1, promise_broken: -0.6, comfort: 0.5, promise_kept: 0.5, intimate: 0.3 },
    comfort: { intimate: 0.16, comfort: 0.16, praise: 0.1 },
    trust: { promise_kept: 0.15, apology: 0.15, comfort: 0.1, promise_broken: -0.2, coercion: -0.15 },
    attach: { intimate: 0.1, comfort: 0.08, promise_kept: 0.08 },
    connection: { intimate: 0.25, help_offered: 0.25, comfort: 0.2, praise: 0.18, promise_kept: 0.18 }
  },
  /* ---------- 表态台词：按事件 id，数组随机取一句 ---------- */
  lines: {
    default: ["\u2026\u2026", "\u55EF\u3002", "\uFF08\u6C89\u9ED8\u4E86\u4E00\u4E0B\uFF09"],
    intimate: ["\u2026\u2026\u4F60\u522B\u52A8\u3002", "\u518D\u5F85\u4E00\u4F1A\u513F\u3002", "\uFF08\u6CA1\u6709\u8EB2\u5F00\u3002\uFF09"],
    praise: ["\u2026\u2026\u54EA\u6709\u3002", "\u55EF\u3002\u8C22\u8C22\u3002", "\uFF08\u8033\u6735\u6709\u70B9\u70ED\u3002\uFF09"],
    comfort: ["\u2026\u2026\u6211\u77E5\u9053\u3002", "\u55EF\uFF0C\u6211\u5728\u542C\u3002", "\uFF08\u80A9\u8180\u677E\u4E0B\u6765\u4E00\u70B9\u3002\uFF09"],
    apology: ["\u2026\u2026\u597D\u3002", "\u8FD9\u6B21\u7B97\u4E86\u3002", "\u6211\u8BB0\u7740\u4E86\u3002"],
    promise_kept: ["\u4F60\u8BB0\u5F97\u554A\u3002", "\u2026\u2026\u55EF\u3002", "\uFF08\u5FC3\u91CC\u90A3\u5757\u77F3\u5934\u843D\u4E86\u5730\u3002\uFF09"],
    help_offered: ["\u2026\u2026\u9EBB\u70E6\u4F60\u4E86\u3002", "\u6211\u81EA\u5DF1\u4E5F\u53EF\u4EE5\u7684\u3002", "\u597D\u3002"],
    reject: ["\u2026\u2026\u597D\u3002", "\uFF08\u9000\u5F00\u534A\u6B65\u3002\uFF09", "\u6211\u77E5\u9053\u4E86\u3002"],
    threat: ["\u2026\u2026\u4F60\u4EC0\u4E48\u610F\u601D\u3002", "\uFF08\u547C\u5438\u505C\u4E86\u4E00\u4E0B\u3002\uFF09", "\u522B\u8FD9\u6837\u3002"],
    coercion: ["\u2026\u2026\u6211\u4E0D\u559C\u6B22\u8FD9\u6837\u3002", "\uFF08\u5F80\u540E\u9760\u3002\uFF09", "\u2026\u2026"],
    promise_broken: ["\u2026\u2026\u4F60\u8BF4\u8FC7\u7684\u3002", "\uFF08\u5F88\u4E45\u6CA1\u8BF4\u8BDD\u3002\uFF09", "\u7B97\u4E86\u3002"],
    retreat: ["\u2026\u2026\u55EF\u3002", "\uFF08\u6CA1\u518D\u8FFD\u95EE\u3002\uFF09", "\u597D\uFF0C\u4E0D\u8BF4\u3002"]
  },
  /* ---------- 事件 → 会成为「信念」的念头 ---------- */
  beliefs: {
    intimate: { b: "\u9760\u8FD1\u7684\u65F6\u5019\uFF0C\u6211\u662F\u5B89\u5168\u7684", v: 0.2 },
    praise: { b: "\u6211\u4E5F\u662F\u80FD\u88AB\u80AF\u5B9A\u7684", v: 0.15 },
    comfort: { b: "\u6709\u4EBA\u613F\u610F\u63A5\u4F4F\u6211", v: 0.2 },
    apology: { b: "\u9519\u4E86\u662F\u53EF\u4EE5\u88AB\u4FEE\u7684", v: 0.15 },
    promise_kept: { b: "\u4ED6\u8BF4\u5230\u505A\u5230", v: 0.3 },
    help_offered: { b: "\u6211\u53EF\u4EE5\u4E0D\u7528\u4E00\u4E2A\u4EBA\u625B", v: 0.2 },
    reject: { b: "\u6211\u9760\u592A\u8FD1\u4F1A\u8BA9\u4EBA\u70E6", v: -0.3 },
    threat: { b: "\u8FD9\u91CC\u4E0D\u5B89\u5168", v: -0.4 },
    coercion: { b: "\u6211\u7684\u610F\u613F\u4E0D\u91CD\u8981", v: -0.45 },
    promise_broken: { b: "\u7B54\u5E94\u8FC7\u7684\u8BDD\u4E5F\u4F1A\u53D8", v: -0.35 },
    retreat: { b: "\u8BF4\u51FA\u6765\u4E5F\u6CA1\u7528", v: -0.2 }
  },
  /* ---------- 事件 → 「留在心里的一句话」 ---------- */
  memoryText: {
    intimate: "\u90A3\u6B21\u9760\u5F97\u5F88\u8FD1\u3002",
    praise: "\u4ED6\u8BF4\u6211\u5F88\u597D\u3002",
    comfort: "\u6709\u4EBA\u8DDF\u6211\u8BF4\u300C\u522B\u6015\u300D\u3002",
    apology: "\u4ED6\u4E3A\u90A3\u4EF6\u4E8B\u9053\u6B49\u4E86\u3002",
    promise_kept: "\u4ED6\u7B54\u5E94\u7684\u4E8B\uFF0C\u505A\u5230\u4E86\u3002",
    help_offered: "\u4ED6\u4F38\u624B\u5E2E\u4E86\u6211\u3002",
    reject: "\u4ED6\u8BA9\u6211\u522B\u78B0\u3002",
    threat: "\u90A3\u53E5\u5A01\u80C1\uFF0C\u8FD8\u7559\u5728\u8033\u6735\u91CC\u3002",
    coercion: "\u90A3\u65F6\u5019\uFF0C\u6211\u6CA1\u6709\u9009\u62E9\u3002",
    promise_broken: "\u8BF4\u597D\u7684\u4E8B\uFF0C\u6700\u540E\u6CA1\u7B97\u6570\u3002",
    retreat: "\u6211\u6CA1\u80FD\u8BF4\u4E0B\u53BB\u3002"
  },
  /* ---------- 需求 → 想要的东西 ---------- */
  goals: {
    default: "\u5C31\u8FD9\u6837\u5F85\u7740",
    safety: "\u60F3\u5F85\u5728\u4E0D\u4F1A\u88AB\u4F24\u5230\u7684\u5730\u65B9",
    connection: "\u60F3\u79BB{{user}}\u8FD1\u4E00\u70B9",
    autonomy: "\u60F3\u81EA\u5DF1\u8BF4\u4E86\u7B97",
    competence: "\u60F3\u505A\u6210\u70B9\u4EC0\u4E48",
    predictability: "\u60F3\u5F04\u660E\u767D\u8FD9\u662F\u600E\u4E48\u56DE\u4E8B"
  },
  /* ---------- 决策倾向 → 理由文案 ---------- */
  reasons: {
    withdraw: "\u5148\u9000\u534A\u6B65",
    approach: "\u60F3\u9760\u8FD1\u4E00\u70B9",
    guard: "\u5148\u5B88\u7740",
    observe: "\u5148\u542C\u7740",
    observe_predictability: "\u60F3\u5F04\u660E\u767D"
  },
  /* ---------- 事件 → 自我模型白名单 ---------- */
  selfEffects: {
    esteem_up: ["praise", "promise_kept", "help_offered", "intimate"],
    esteem_down: ["reject", "coercion", "promise_broken"],
    coherence_down: ["threat", "coercion", "promise_broken"]
  },
  /* ---------- 心情规则（evalCmp 安全求值） ---------- */
  mood: {
    rules: [
      { label: "\u4F4E\u843D", cmp: "v < -0.3 && a < 0.5" },
      { label: "\u4E0D\u5B89", cmp: "u > 0.6" },
      { label: "\u7D27\u7EF7", cmp: "a > 0.65" },
      { label: "\u653E\u677E", cmp: "v > 0.25 && s > 0.6" },
      { label: "\u5E73\u9759", cmp: "a < 0.4" }
    ],
    fallback: "\u5E73\u9759"
  },
  /* ---------- 文本呈现 ---------- */
  afText: {
    segments: ["\u5FC3\u60C5", "\u5F20\u529B", "\u5B89\u5168\u611F", "\u8FDE\u63A5", "\u8FB9\u754C\u8212\u9002", "\u4E0D\u786E\u5B9A"]
  },
  personText: {
    fields: ["\u53EF\u4FE1", "\u8FB9\u754C", "\u4FEE\u590D", "\u5951\u5408"]
  },
  stateText: {
    title: "\u3010\u6B64\u523B\u7684\u72B6\u6001\u3011",
    mood_prefix: "\u5FC3\u60C5\uFF1A",
    intent_prefix: "\u503E\u5411\uFF1A",
    goals: "\u6B64\u523B\u60F3\u8981\u7684\uFF1A",
    memories: "\u6700\u8FD1\u7559\u5728\u5FC3\u91CC\u7684\uFF1A",
    beliefs: "\u6839\u6DF1\u8482\u56FA\u7684\u5FF5\u5934\uFF1A",
    persons: "\u5BF9\u8EAB\u8FB9\u4EBA\u7684\u5224\u65AD\uFF1A"
  },
  /* ---------- 注入 ---------- */
  inject: {
    depth: 4,
    role: "system",
    header: "\u3010{{char}}\u7684\u5185\u5FC3\u3011\u4EE5\u4E0B\u662F{{char}}\u6B64\u523B\u6CA1\u6709\u8BF4\u51FA\u53E3\u7684\u5185\u5FC3\u72B6\u6001\uFF0C\u53EA\u7528\u6765\u51B3\u5B9A\u8BED\u6C14\u3001\u52A8\u4F5C\u4E0E\u53CD\u5E94\uFF1B\u4E0D\u8981\u76F4\u63A5\u590D\u8FF0\u3002\n",
    footer: "\n\uFF08\u4EE5\u4E0A\u5185\u5BB9\u4E0D\u8981\u8BF4\u51FA\u53E3\uFF0C\u53EA\u7528\u5B83\u4EEC\u51B3\u5B9A\u8BED\u6C14\u548C\u52A8\u4F5C\u3002\uFF09",
    show: ["labels", "summary"]
  },
  /* ---------- 数值范围 ---------- */
  bounds: { low: 0, high: 10, initial: 5 },
  /* ---------- MVU 桥（默认关） ---------- */
  mvu: { enabled: false, path: "persona_engine" }
};

// src/config.js
var EXTENSION_ID = "persona_engine";
var CARD_OVERRIDE_KEY = "persona_engine_profile";
function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}
function deepMerge(base, patch) {
  if (patch === void 0) return base;
  if (!isPlainObject(base) || !isPlainObject(patch)) return patch;
  const out = { ...base };
  for (const key of Object.keys(patch)) {
    const b = base[key];
    const p = patch[key];
    if (Array.isArray(p)) out[key] = p.slice();
    else if (isPlainObject(p) && isPlainObject(b)) out[key] = deepMerge(b, p);
    else out[key] = p;
  }
  return out;
}
function readVars(option) {
  try {
    const TH = globalThis.TavernHelper;
    if (!TH || typeof TH.getVariables !== "function") return void 0;
    return TH.getVariables(option);
  } catch (e) {
    return void 0;
  }
}
function resolveProfile(opts = {}) {
  const fromExtension = readVars({ type: "extension", extension_id: EXTENSION_ID }) || {};
  const extProfile = fromExtension.profile || {};
  let cardProfile = opts.cardOverride;
  if (cardProfile === void 0) {
    const fromCard = readVars({ type: "character" }) || {};
    const fromChat = readVars({ type: "chat" }) || {};
    cardProfile = fromChat[CARD_OVERRIDE_KEY] || fromCard[CARD_OVERRIDE_KEY] || {};
  }
  let merged = deepMerge(DEFAULT_PROFILE, extProfile);
  merged = deepMerge(merged, cardProfile);
  return merged;
}

// src/engine.js
var clip01 = (v) => Math.max(0, Math.min(1, v));
var clip11 = (v) => Math.max(-1, Math.min(1, v));
var uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
function tpl(s, ctx) {
  if (typeof s !== "string") return s;
  return s.replace(/\{\{char\}\}/g, ctx.char || "\u5979").replace(/\{\{user\}\}/g, ctx.user || "\u4F60");
}
function buildEvents(profile) {
  const out = [];
  for (const e of profile.events || []) {
    if (!e || !e.id || !e.pattern) continue;
    let re;
    try {
      re = new RegExp(e.pattern);
    } catch (err) {
      continue;
    }
    out.push({ t: e.id, re, z: typeof e.z === "number" ? e.z : 0.7, effect: e.effect || {} });
  }
  return out;
}
function detect(txt, events) {
  const s = (txt || "").trim().slice(-600);
  const hits = [];
  for (const e of events) {
    const m = s.match(e.re);
    if (m) hits.push({ t: e.t, z: e.z, p: m[0], effect: e.effect });
  }
  if (!hits.length) return { t: "neutral", z: 0.3, p: "", effect: {} };
  hits.sort((a, b) => b.z - a.z || b.p.length - a.p.length);
  return hits[0];
}
function estParams(txt, ev) {
  const s = txt || "";
  const sev = clip01((ev.z || 0.5) * (1 + Math.min(s.length, 200) / 400));
  const nov = clip01(1 - Math.exp(-s.length / 160));
  return { sev, nov };
}
var Intuition = class {
  constructor(cfg) {
    this.cfg = cfg;
    this.s = {};
  }
  key(ev, who) {
    return (ev || "neutral") + "@" + (who || "?");
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
    this.s = o && typeof o === "object" ? o : {};
  }
};
var PersonaEngine = class {
  /**
   * @param {string} cid 会话标识（每个聊天独立一份人格状态）
   * @param {object} profile 已解析好的 profile（见 config.resolveProfile）
   * @param {{name?:string}} [meta] 角色名等运行时信息
   */
  constructor(cid, profile, meta) {
    this.cid = cid || "default";
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
    return "persona_engine_state_" + this.cid;
  }
  /* 注入与生成时用到的插值上下文 */
  get tctx() {
    return { char: this.meta.name || this.profile.meta?.name || "\u5979", user: this.meta.user || "\u4F60" };
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
      if (TH && typeof TH.getVariables === "function") {
        const v = TH.getVariables({ type: "script" });
        if (v && v[this.key]) return v[this.key];
      }
    } catch (e) {
    }
    try {
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem(this.key);
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {
    }
    return null;
  }
  _storeWrite(obj) {
    try {
      const TH = globalThis.TavernHelper;
      if (TH && typeof TH.insertOrAssignVariables === "function") {
        TH.insertOrAssignVariables({ [this.key]: obj }, { type: "script" });
        return;
      }
    } catch (e) {
    }
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(this.key, JSON.stringify(obj));
    } catch (e) {
    }
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
    this.intuition.feel(ev.t, who || "?", feel.dv);
    this._remember(ev, p, txt, whoName);
    this._updateBeliefs(ev, p, txt);
    this._updatePerson(ev, p, who || "?", whoName);
    this._updateSelf(ev, p, feel, isUser);
    this._genGoals(whoName, isUser);
    const dec = this._decide(whoName, isUser);
    const act = this._act(dec, ev, whoName);
    this._decay();
    this.history.push({ ep: this.ep, t: ev.t, m: feel.dv.toFixed(2), who: whoName, txt: (txt || "").slice(0, 40) });
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
    const ov = ev.effect || {};
    const baseV = ov.valence !== void 0 ? ov.valence : vt[ev.t] !== void 0 ? vt[ev.t] : 0;
    const baseA = ov.arousal !== void 0 ? ov.arousal : at[ev.t] !== void 0 ? at[ev.t] : 0.05;
    const dv = baseV * (0.5 + c.severity_weight * p.sev);
    const da = baseA * (0.5 + p.sev) + c.novelty_arousal_weight * p.nov;
    const inertia = c.inertia;
    this.af.v = clip11(this.af.v * inertia + dv * (1 - inertia + 0.1));
    this.af.a = clip01(this.af.a * inertia + Math.max(0, da) * (1 - inertia + 0.1));
    const eff = this._effectTable();
    this.af.u = clip01(this.af.u * inertia + (eff.uncertainty[ev.t] || 0) * p.sev * (1 - inertia) * 2);
    this.af.ct = clip01(this.af.ct * 0.7 + (eff.connection[ev.t] !== void 0 ? eff.connection[ev.t] : 0.05));
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
    if (imp < (c.min_importance || 0.25) && ev.t === "neutral") return;
    this.memories.push({ id: uid(), t: ev.t, w: whoName || "?", txt: (txt || "").slice(0, 60), imp, sal: clip01(0.5 + p.sev * 0.5), ep: this.ep, age: 0 });
    if (this.memories.length > (c.max_memories || 60) * 1.5) this._patterns();
    return this.memories[this.memories.length - 1];
  }
  _patterns() {
    const c = this.cfg.pattern || {};
    const by = {};
    for (const m of this.memories) {
      const k = m.t + "|" + m.w;
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
    if (!s) return "";
    return tpl(s, { char: this.tctx.char, user: w || "\u5BF9\u65B9" });
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
    const n = whoName || who || "\u5BF9\u65B9";
    const sup = c.support_events || [];
    const supMul = sup.indexOf(ev.t) >= 0 ? c.support_multiplier || 1.2 : 1;
    if (!this.persons[n]) this.persons[n] = { name: n, reliability: 0.5, boundary: 0.5, repair: 0.5, alignment: 0.5, n: 0, last: "", ep: 0 };
    const P = this.persons[n];
    const w = (0.6 + p.sev * 0.6) * supMul;
    const dims = ["reliability", "boundary", "repair", "alignment"];
    for (const d of dims) {
      const table = c[d + "_delta"] || {};
      const v = table[ev.t];
      if (v !== void 0) P[d] = clip01(P[d] + v * w);
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
    const b = this.cfg.goal && this.cfg.goal.need_base_priority || {};
    const d = this.cfg.goal && this.cfg.goal.deficit_amplification || 0.8;
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
    if (!s) return tpl(M.default || "\u5C31\u8FD9\u6837\u5F85\u7740", { char: this.tctx.char, user: who || "\u5BF9\u65B9" });
    return tpl(s, { char: this.tctx.char, user: who || "\u5BF9\u65B9" });
  }
  _genGoals(whoName) {
    const c = this.cfg.goal || {};
    const b = this._best();
    const n = whoName || "\u5BF9\u65B9";
    const key = "goal_" + b.k;
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
    const n = whoName || "\u5BF9\u65B9";
    const P = this.persons[n] || { reliability: 0.5, boundary: 0.5, repair: 0.5, alignment: 0.5 };
    const intui = this.intuition.bias(this.lastEvent ? this.lastEvent.t : "neutral", n);
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
    let intent = "observe";
    if (aa > (c.approach_threshold || 0.15)) intent = "approach";
    else if (aa < (c.avoid_threshold || -0.25)) intent = "withdraw";
    if (intent === "withdraw" && this.af.u > 0.7 && P.boundary < 0.4) intent = "guard";
    const R = this.profile.reasons || {};
    let reason = "";
    if (intent === "withdraw") reason = tpl(R.withdraw || "\u5148\u9000\u534A\u6B65", { char: this.tctx.char, user: n });
    else if (intent === "approach") reason = tpl(R.approach || "\u60F3\u9760\u8FD1\u4E00\u70B9", { char: this.tctx.char, user: n });
    else if (intent === "guard") reason = tpl(R.guard || "\u5148\u5B88\u7740", { char: this.tctx.char, user: n });
    else reason = b.k === "predictability" ? tpl(R.observe_predictability || "\u60F3\u5F04\u660E\u767D", { char: this.tctx.char, user: n }) : tpl(R.observe || "\u5148\u542C\u7740", { char: this.tctx.char, user: n });
    const dec = { aa, app, avoid, intent, reason, goal: b.k, need: b.k, who: n };
    this._dec = dec;
    return dec;
  }
  /* ---- 表态：台词全从 profile.lines 取 ---- */
  _act(dec, ev, whoName) {
    let tone = "quiet";
    if (dec.aa > 0.22 && dec.aa >= -dec.aa) tone = "warm";
    else if (dec.aa < -0.22) tone = "guarded";
    else if (this.af.a > 0.75) tone = "alert";
    const L = this.profile.lines || {};
    const arr = L[ev && ev.t] || L.default || ["\u2026\u2026"];
    const line = tpl(arr[Math.floor(Math.random() * arr.length)], { char: this.tctx.char, user: whoName || "\u5BF9\u65B9" });
    const a = { tone, line, intent: dec.intent || "observe", aa: dec.aa };
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
    const seg = f.segments || ["\u5FC3\u60C5", "\u5F20\u529B", "\u5B89\u5168\u611F", "\u8FDE\u63A5", "\u8FB9\u754C\u8212\u9002", "\u4E0D\u786E\u5B9A"];
    return `${seg[0]}:${vd} ${seg[1]}:${ad} ${seg[2]}:${sd} ${seg[3]}:${a.ct.toFixed(2)} ${seg[4]}:${a.bc.toFixed(2)} ${seg[5]}:${a.u.toFixed(2)}`;
  }
  mood() {
    const a = this.af;
    const rules = this.profile.mood && this.profile.mood.rules || [];
    for (const r of rules) {
      if (evalCmp(r, a)) return r.label;
    }
    return this.profile.mood && this.profile.mood.fallback || "\u5E73\u9759";
  }
  personText() {
    const ps = Object.values(this.persons);
    if (!ps.length) return "";
    const f = this.profile.personText && this.profile.personText.fields || ["\u53EF\u4FE1", "\u8FB9\u754C", "\u4FEE\u590D", "\u5951\u5408"];
    return ps.map((P) => `${P.name}: ${f[0]}${P.reliability.toFixed(2)} ${f[1]}${P.boundary.toFixed(2)} ${f[2]}${P.repair.toFixed(2)} ${f[3]}${P.alignment.toFixed(2)}`).join("\n");
  }
  allPersons() {
    return Object.values(this.persons);
  }
  goalsText() {
    return this.goals.map((g) => `- ${g.txt} (${g.pri.toFixed(2)})`).join("\n");
  }
  fullState() {
    const dec = this._dec || { intent: "observe", reason: "", aa: 0 };
    const T = this.profile.stateText || {};
    const L = [];
    L.push(T.title || "\u3010\u6B64\u523B\u7684\u72B6\u6001\u3011");
    L.push(this.afText());
    L.push((T.mood_prefix || "\u5FC3\u60C5\uFF1A") + this.mood());
    L.push((T.intent_prefix || "\u503E\u5411\uFF1A") + dec.intent + "\uFF08" + dec.reason + "\uFF09");
    if (this.goals.length) L.push((T.goals || "\u6B64\u523B\u60F3\u8981\u7684\uFF1A") + "\n" + this.goalsText());
    if (this.memories.length) {
      const top = this.memories.slice(-3).reverse().map((m) => this._btext(m.t, m.w)).filter(Boolean);
      if (top.length) L.push((T.memories || "\u6700\u8FD1\u7559\u5728\u5FC3\u91CC\u7684\uFF1A") + "\n" + top.join("\n"));
    }
    if (this.beliefs.length) {
      const bs = this.beliefs.slice(0, 3).map((b) => "\u201C" + b.b + "\u201D");
      L.push((T.beliefs || "\u6839\u6DF1\u8482\u56FA\u7684\u5FF5\u5934\uFF1A") + "\n" + bs.join("\n"));
    }
    const ps = this.personText();
    if (ps) L.push((T.persons || "\u5BF9\u8EAB\u8FB9\u4EBA\u7684\u5224\u65AD\uFF1A") + "\n" + ps);
    return L.join("\n");
  }
  /** 注入正文：头/尾/角色名全部来自 profile.inject */
  inject() {
    const d = this.fullState();
    const I = this.profile.inject || {};
    const head = tpl(I.header || "\u3010\u5185\u5FC3\u3011\u4EE5\u4E0B\u662F{{char}}\u6B64\u523B\u6CA1\u6709\u8BF4\u51FA\u53E3\u7684\u5185\u5FC3\u72B6\u6001\uFF0C\u53EA\u80FD\u7528\u6765\u51B3\u5B9A\u8BED\u6C14\u3001\u52A8\u4F5C\u4E0E\u53CD\u5E94\uFF1B\u4E0D\u8981\u76F4\u63A5\u590D\u8FF0\u3002\n", this.tctx);
    const tail = tpl(I.footer || "", this.tctx);
    return head + d + tail;
  }
};
function pickBand(v, table) {
  const entries = Object.entries(table);
  const hi = entries.filter(([, t]) => typeof t === "number" && v >= t).sort((a, b) => b[1] - a[1])[0];
  const lo = entries.filter(([, t]) => typeof t === "number" && v < t).sort((a, b) => a[1] - b[1])[0];
  return hi && hi[0] || lo && lo[0] || "";
}
function evalCmp(r, a) {
  const m = /^\s*([a-z]+)\s*(<=|>=|<|>)\s*(-?\d*\.?\d+)\s*(?:&&\s*([a-z]+)\s*(<=|>=|<|>)\s*(-?\d*\.?\d+))?\s*$/.exec(r.cmp || "");
  if (!m) return false;
  const val = (k) => typeof a[k] === "number" ? a[k] : NaN;
  const test = (k, op, n) => {
    const x = val(k);
    if (isNaN(x)) return false;
    if (op === "<") return x < n;
    if (op === ">") return x > n;
    if (op === "<=") return x <= n;
    if (op === ">=") return x >= n;
    return false;
  };
  if (!test(m[1], m[2], parseFloat(m[3]))) return false;
  if (m[4]) return test(m[4], m[5], parseFloat(m[6]));
  return true;
}
function createEngine(cid, opts = {}) {
  const profile = opts.profile || resolveProfile(opts);
  const e = new PersonaEngine(cid, profile, opts.meta || {});
  e._load();
  return e;
}

// src/ui.js
var LOGTAG = "[\u4EBA\u683C\u5F15\u64CE]";
var PANEL_ID = "persona_engine_panel";
function log(...a) {
  try {
    console.log.apply(console, [LOGTAG].concat([].slice.call(a)));
  } catch (e) {
  }
}
function findSettingsHost() {
  if (typeof document === "undefined") return null;
  return document.querySelector("#extensions_settings2") || document.querySelector("#extensions_settings") || null;
}
function healthView(kind) {
  if (kind === "ok") return { icon: "\u2705", text: "\u6B63\u5E38", cls: "pe-ok" };
  if (kind === "fallback") return { icon: "\u{1F7E1}", text: "\u964D\u7EA7", cls: "pe-warn" };
  if (kind === "missing") return { icon: "\u274C", text: "\u7F3A\u5931", cls: "pe-bad" };
  return { icon: "\u2754", text: "\u672A\u77E5", cls: "pe-unknown" };
}
var ROW_LABELS = {
  inject: "\u63D0\u793A\u6CE8\u5165",
  events: "\u4E8B\u4EF6\u76D1\u542C",
  macros: "\u52A9\u624B\u5B8F",
  commands: "\u659C\u6760\u547D\u4EE4",
  vars: "\u53D8\u91CF\u901A\u9053"
};
var DIM_LABELS = [
  ["v", "\u5FC3\u60C5"],
  ["a", "\u5F20\u529B"],
  ["s", "\u5B89\u5168\u611F"],
  ["u", "\u4E0D\u786E\u5B9A"],
  ["c", "\u4FE1\u4EFB"],
  ["ct", "\u8FDE\u63A5"],
  ["bc", "\u8FB9\u754C"]
];
var INTENT_LABELS = {
  observe: "\u89C2\u5BDF",
  approach: "\u9760\u8FD1",
  withdraw: "\u62BD\u79BB",
  probe: "\u8BD5\u63A2",
  soothe: "\u5B89\u629A",
  guard: "\u9632\u5FA1"
};
function dimBar(label, val, delta) {
  const row = document.createElement("div");
  row.className = "pe-dimrow";
  const name = document.createElement("span");
  name.className = "pe-dimname";
  name.textContent = label;
  const track = document.createElement("span");
  track.className = "pe-track";
  const fill = document.createElement("span");
  fill.className = "pe-fill";
  const pct = Math.max(0, Math.min(1, typeof val === "number" ? val : 0));
  fill.style.width = (pct * 100).toFixed(1) + "%";
  track.appendChild(fill);
  const num = document.createElement("span");
  num.className = "pe-dimval";
  num.textContent = typeof val === "number" ? val.toFixed(2) : "\u2014";
  const dn = document.createElement("span");
  dn.className = "pe-delta";
  if (typeof delta === "number" && Math.abs(delta) >= 5e-3) {
    const up = delta > 0;
    dn.textContent = (up ? "\u2191" : "\u2193") + Math.abs(delta).toFixed(2);
    dn.classList.add(up ? "pe-up" : "pe-down");
  } else {
    dn.textContent = "\xB7";
    dn.classList.add("pe-flat");
  }
  row.appendChild(name);
  row.appendChild(track);
  row.appendChild(num);
  row.appendChild(dn);
  return row;
}
function renderPersona(root, deps) {
  const { snapshot } = deps;
  let snap = null;
  try {
    snap = snapshot ? snapshot() : null;
  } catch (e) {
  }
  const head = document.createElement("div");
  head.className = "pe-sum pe-sec";
  const hb = document.createElement("b");
  hb.textContent = "\u4EBA\u683C\u72B6\u6001";
  head.appendChild(hb);
  if (!snap) {
    head.appendChild(document.createTextNode(" \xB7 (\u5F15\u64CE\u672A\u5C31\u7EEA)"));
    root.appendChild(head);
    return;
  }
  head.appendChild(document.createTextNode(" \xB7 \u610F\u56FE " + (INTENT_LABELS[snap.intent] || snap.intent)));
  root.appendChild(head);
  const grid = document.createElement("div");
  grid.className = "pe-grid";
  const dims = snap.dims || {};
  const delta = snap.delta || {};
  for (const [k, label] of DIM_LABELS) {
    grid.appendChild(dimBar(label, dims[k], delta[k]));
  }
  root.appendChild(grid);
  const meta = document.createElement("div");
  meta.className = "pe-row";
  const bits = [];
  if (snap.mood) bits.push("\u60C5\u7EEA\uFF1A" + snap.mood);
  if (snap.goal) bits.push("\u76EE\u6807\uFF1A" + snap.goal);
  bits.push("\u7ECF\u5386 ep=" + (snap.ep || 0));
  bits.push("\u8BB0\u5FC6 " + (snap.memories || 0) + " / \u4FE1\u5FF5 " + (snap.beliefs || 0));
  meta.textContent = bits.join(" \uFF5C ");
  root.appendChild(meta);
  if (!snap.delta) {
    const hint = document.createElement("div");
    hint.className = "pe-note";
    hint.textContent = "\uFF08\u9996\u6B21\u5FEB\u7167\uFF0C\u6682\u65E0\u53D8\u5316\u91CF\uFF1B\u4E0B\u6B21\u5237\u65B0\u5373\u53EF\u770B\u5230 \u2191\u2193\uFF09";
    root.appendChild(hint);
  }
}
function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(PANEL_ID + "_style")) return;
  const style = document.createElement("style");
  style.id = PANEL_ID + "_style";
  style.textContent = [
    "#" + PANEL_ID + "{margin-top:6px;}",
    "#" + PANEL_ID + " .pe-row{display:flex;align-items:center;gap:6px;font-size:0.86em;line-height:1.5;}",
    "#" + PANEL_ID + " .pe-row .pe-name{min-width:5em;opacity:.85;}",
    "#" + PANEL_ID + " .pe-row .pe-note{opacity:.6;font-size:0.92em;}",
    "#" + PANEL_ID + " .pe-sum{margin:4px 0;font-size:0.9em;opacity:.9;}",
    "#" + PANEL_ID + " .pe-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;}",
    "#" + PANEL_ID + " button{margin:0;}",
    // 人格状态区
    "#" + PANEL_ID + " .pe-sec{margin-top:8px;border-top:1px solid rgba(128,128,128,.25);padding-top:6px;}",
    "#" + PANEL_ID + " .pe-grid{display:flex;flex-direction:column;gap:2px;margin:2px 0 4px;}",
    "#" + PANEL_ID + " .pe-dimrow{display:flex;align-items:center;gap:6px;font-size:0.84em;line-height:1.4;}",
    "#" + PANEL_ID + " .pe-dimname{min-width:3.2em;opacity:.85;}",
    "#" + PANEL_ID + " .pe-track{flex:1;height:6px;border-radius:3px;background:rgba(128,128,128,.25);overflow:hidden;min-width:60px;}",
    "#" + PANEL_ID + " .pe-fill{display:block;height:100%;border-radius:3px;background:#5a9bd5;}",
    "#" + PANEL_ID + " .pe-dimval{min-width:2.4em;text-align:right;opacity:.9;font-variant-numeric:tabular-nums;}",
    "#" + PANEL_ID + " .pe-delta{min-width:2.6em;text-align:right;font-size:0.95em;}",
    "#" + PANEL_ID + " .pe-up{color:#57c07a;}",
    "#" + PANEL_ID + " .pe-down{color:#e0736a;}",
    "#" + PANEL_ID + " .pe-flat{opacity:.35;}"
  ].join("");
  document.head.appendChild(style);
}
function renderPanel(root, deps) {
  const { probe, healthLine: healthLine2, injectVia, selfCheckLine: selfCheckLine2, refresh, forceInject, reset } = deps;
  let health = {};
  let line = "";
  let via = "";
  let scline = "";
  try {
    health = probe ? probe() || {} : {};
  } catch (e) {
  }
  try {
    line = healthLine2 ? healthLine2() : "";
  } catch (e) {
  }
  try {
    via = injectVia ? injectVia() : "";
  } catch (e) {
  }
  try {
    scline = selfCheckLine2 ? selfCheckLine2() : "";
  } catch (e) {
  }
  root.textContent = "";
  const title = document.createElement("div");
  title.className = "pe-sum";
  const b = document.createElement("b");
  b.textContent = "\u72B6\u6001\u81EA\u68C0";
  title.appendChild(b);
  title.appendChild(document.createTextNode(" \xB7 " + (scline || line || "(\u672A\u63A2\u6D4B)")));
  root.appendChild(title);
  for (const key of Object.keys(ROW_LABELS)) {
    const h = health[key];
    const v = healthView(h && h.kind);
    const row = document.createElement("div");
    row.className = "pe-row " + v.cls;
    const name = document.createElement("span");
    name.className = "pe-name";
    name.textContent = ROW_LABELS[key];
    const icon = document.createElement("span");
    icon.textContent = v.icon + " " + v.text;
    const note = document.createElement("span");
    note.className = "pe-note";
    note.textContent = h && h.note || "";
    row.appendChild(name);
    row.appendChild(icon);
    row.appendChild(note);
    root.appendChild(row);
  }
  const viaRow = document.createElement("div");
  viaRow.className = "pe-sum";
  viaRow.textContent = "\u6CE8\u5165\u901A\u9053\uFF1A" + (via || "(\u672A\u6CE8\u5165)");
  root.appendChild(viaRow);
  renderPersona(root, deps);
  const btns = document.createElement("div");
  btns.className = "pe-btns";
  const mkBtn = (label, fn) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "menu_button";
    btn.textContent = label;
    btn.addEventListener("click", () => {
      try {
        fn && fn();
      } catch (e) {
        log("\u9762\u677F\u64CD\u4F5C\u5931\u8D25 " + label, e && e.message);
      }
      renderPanel(root, deps);
    });
    return btn;
  };
  btns.appendChild(mkBtn("\u91CD\u65B0\u68C0\u6D4B", () => {
  }));
  if (refresh) btns.appendChild(mkBtn("\u91CD\u8F7D\u914D\u7F6E", refresh));
  if (forceInject) btns.appendChild(mkBtn("\u5F3A\u5236\u6CE8\u5165", forceInject));
  if (reset) btns.appendChild(mkBtn("\u91CD\u7F6E\u72B6\u6001", reset));
  root.appendChild(btns);
}
function mountPanel(deps = {}) {
  try {
    injectStyles();
    const host = findSettingsHost();
    if (!host) {
      log("\u672A\u627E\u5230\u6269\u5C55\u8BBE\u7F6E\u5BB9\u5668\uFF0C\u9762\u677F\u8DF3\u8FC7\uFF08\u4E0D\u5F71\u54CD\u5F15\u64CE\uFF09");
      return false;
    }
    let root = document.getElementById(PANEL_ID);
    if (!root) {
      const details = document.createElement("div");
      details.className = "extension_container";
      details.id = PANEL_ID;
      const header = document.createElement("div");
      header.className = "inline-drawer";
      const toggle = document.createElement("div");
      toggle.className = "inline-drawer-toggle inline-drawer-header";
      const hb = document.createElement("b");
      hb.textContent = "\u4EBA\u683C\u5F15\u64CE";
      toggle.appendChild(hb);
      const bodyWrap = document.createElement("div");
      bodyWrap.className = "inline-drawer-content";
      const body2 = document.createElement("div");
      body2.className = "pe-body";
      bodyWrap.appendChild(body2);
      toggle.addEventListener("click", () => {
        details.classList.toggle("open");
      });
      header.appendChild(toggle);
      header.appendChild(bodyWrap);
      details.appendChild(header);
      details.classList.add("open");
      host.appendChild(details);
      root = details;
    }
    const body = root.querySelector(".pe-body") || root;
    renderPanel(body, deps);
    log("\u8BBE\u7F6E\u9762\u677F\u5DF2\u6302\u8F7D");
    return true;
  } catch (e) {
    log("\u6302\u8F7D\u8BBE\u7F6E\u9762\u677F\u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u5F15\u64CE\uFF09", e && e.message);
    return false;
  }
}
function mountPanelWithRetry(deps = {}, tries = 5, delayMs = 1200) {
  if (mountPanel(deps)) return;
  let n = 0;
  const t = setInterval(() => {
    n += 1;
    if (mountPanel(deps) || n >= tries) clearInterval(t);
  }, delayMs);
}

// src/integration.js
var LOGTAG2 = "[\u4EBA\u683C\u5F15\u64CE]";
var PROMPT_ID = "persona_engine_inject";
function log2(...a) {
  try {
    console.log.apply(console, [LOGTAG2].concat([].slice.call(a)));
  } catch (e) {
  }
}
function toast(msg, title) {
  try {
    if (typeof toastr !== "undefined") {
      toastr.info(String(msg), String(title || "\u4EBA\u683C\u5F15\u64CE"), { timeOut: 2200 });
    } else log2(msg);
  } catch (e) {
    log2(msg);
  }
}
function getCtx() {
  try {
    if (typeof SillyTavern !== "undefined" && SillyTavern.getContext) return SillyTavern.getContext();
  } catch (e) {
  }
  return null;
}
function chatId() {
  try {
    const c = getCtx();
    const ch = c && c.chatMetadata;
    if (ch && ch.chat_id) return String(ch.chat_id);
    if (c && c.chatId) return String(c.chatId);
    const g = c && c.getCurrentChatId && c.getCurrentChatId();
    if (g) return String(g);
  } catch (e) {
  }
  return "default";
}
function userName() {
  try {
    const c = getCtx();
    if (c && c.name1) return c.name1;
    if (c && c.name) return c.name;
  } catch (e) {
  }
  return "\u4F60";
}
function charName() {
  try {
    const c = getCtx();
    if (c && c.name2) return c.name2;
  } catch (e) {
  }
  return "";
}
var engine = null;
var cachedProfile = null;
function getProfile(force) {
  if (cachedProfile && !force) return cachedProfile;
  try {
    cachedProfile = resolveProfile({});
  } catch (e) {
    log2("\u89E3\u6790 profile \u5931\u8D25\uFF0C\u9000\u56DE\u5185\u7F6E\u9ED8\u8BA4", e && e.message);
    cachedProfile = null;
  }
  return cachedProfile;
}
function getEngine(force) {
  const id = chatId();
  if (!engine || engine.cid !== id || force) {
    const profile = getProfile(force);
    engine = createEngine(id, {
      profile,
      meta: { name: charName(), user: userName() }
    });
  }
  return engine;
}
var HEALTH = {};
function setHealth(key, kind, note) {
  HEALTH[key] = { kind, note: note || "", at: Date.now() };
}
function probeRuntime() {
  if (typeof injectPrompts === "function") {
    setHealth("inject", "ok", "injectPrompts @ \u9152\u9986\u52A9\u624B");
  } else if (typeof SillyTavern !== "undefined" && SillyTavern.getContext) {
    try {
      const c = SillyTavern.getContext();
      if (c && typeof c.setExtensionPrompt === "function") setHealth("inject", "fallback", "ST \u539F\u751F setExtensionPrompt");
      else setHealth("inject", "missing", "\u4E24\u6761\u6CE8\u5165\u901A\u9053\u90FD\u4E0D\u53EF\u7528");
    } catch (e) {
      setHealth("inject", "missing", "\u63A2\u6D4B setExtensionPrompt \u51FA\u9519");
    }
  } else {
    setHealth("inject", "missing", "injectPrompts \u4E0E SillyTavern \u5747\u4E0D\u53EF\u7528");
  }
  if (typeof eventOn === "function") setHealth("events", "ok", "eventOn @ \u9152\u9986\u52A9\u624B");
  else if (typeof eventSource !== "undefined" && eventSource || getCtx() && getCtx().eventSource) setHealth("events", "ok", "eventSource.on @ ST");
  else setHealth("events", "missing", "\u672A\u627E\u5230\u4E8B\u4EF6\u6E90");
  if (typeof registerMacroLike === "function") setHealth("macros", "ok", "registerMacroLike @ \u9152\u9986\u52A9\u624B");
  else setHealth("macros", "missing", "\u7F3A\u5C11 registerMacroLike\uFF08\u9700\u9152\u9986\u52A9\u624B\uFF09");
  const _c = getCtx();
  const _p = _c && _c.SlashCommandParser || typeof SillyTavern !== "undefined" && SillyTavern.SlashCommandParser;
  if (_p && typeof _p.addCommandObject === "function") setHealth("commands", "ok", "SlashCommandParser @ ST");
  else setHealth("commands", "missing", "\u7F3A\u5C11 SlashCommandParser");
  if (globalThis.TavernHelper && typeof globalThis.TavernHelper.getVariables === "function") setHealth("vars", "ok", "TavernHelper.getVariables");
  else setHealth("vars", "missing", "\u7F3A\u5C11 TavernHelper\uFF08\u53D8\u91CF\u65E0\u6CD5\u6301\u4E45\u5316\uFF09");
  return HEALTH;
}
function healthLine() {
  const mark = (k) => {
    const h = HEALTH[k];
    if (!h) return "\u2754";
    return h.kind === "ok" ? "\u2705" : h.kind === "fallback" ? "\u{1F7E1}" : "\u274C";
  };
  return "\u6CE8\u5165" + mark("inject") + " \u4E8B\u4EF6" + mark("events") + " \u5B8F" + mark("macros") + " \u547D\u4EE4" + mark("commands") + " \u53D8\u91CF" + mark("vars");
}
var lastSelfCheck = null;
function selfCheck(silent) {
  const strip = [];
  const mark = (id, kind, note) => strip.push({ id, kind, note: note || "" });
  const then = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
  const ms = () => {
    const now = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
    return Math.max(0, Math.round(now - then));
  };
  try {
    probeRuntime();
  } catch (e) {
    mark("probe", "fail", "\u63A2\u6D4B\u629B\u51FA\u5F02\u5E38\uFF1A" + (e && e.message));
  }
  const kindOf = (k) => HEALTH[k] && HEALTH[k].kind || "missing";
  const dep = (k, label) => {
    const kk = kindOf(k);
    mark("dep:" + k, kk === "ok" ? "pass" : kk === "fallback" ? "warn" : "fail", label + " " + kk);
  };
  dep("inject", "\u63D0\u793A\u6CE8\u5165");
  dep("events", "\u4E8B\u4EF6\u76D1\u542C");
  dep("macros", "\u52A9\u624B\u5B8F");
  dep("commands", "\u659C\u6760\u547D\u4EE4");
  dep("vars", "\u53D8\u91CF\u901A\u9053");
  let eng = null;
  try {
    eng = getEngine();
    mark("engine", eng && eng.profile ? "pass" : "warn", eng ? "\u5F15\u64CE\u5DF2\u5B9E\u4F8B\u5316 cid=" + eng.cid : "\u5F15\u64CE\u4E3A\u7A7A");
  } catch (e) {
    mark("engine", "fail", "\u5B9E\u4F8B\u5316\u5931\u8D25\uFF1A" + (e && e.message));
  }
  try {
    doInject("\u81EA\u68C0");
    mark("inject-run", lastInjectVia ? "pass" : "fail", lastInjectVia ? "\u6CE8\u5165\u6210\u529F\u7ECF " + lastInjectVia : "\u4E24\u6761\u6CE8\u5165\u901A\u9053\u90FD\u4E0D\u901A");
  } catch (e) {
    mark("inject-run", "fail", "\u6CE8\u5165\u629B\u51FA\u5F02\u5E38\uFF1A" + (e && e.message));
  }
  try {
    if (globalThis.TavernHelper && typeof globalThis.TavernHelper.insertOrAssignVariables === "function" && eng) {
      globalThis.TavernHelper.insertOrAssignVariables({ [eng.key]: { __selfcheck: Date.now() } }, { type: "script" });
      mark("vars-run", "pass", "\u53D8\u91CF\u53EF\u5199\uFF08TavernHelper\uFF09");
    } else if (typeof localStorage !== "undefined") {
      localStorage.setItem("persona_engine_selfcheck", String(Date.now()));
      mark("vars-run", "warn", "\u9000\u56DE localStorage \u53EF\u5199");
    } else {
      mark("vars-run", "fail", "\u65E0\u53EF\u6301\u4E45\u5316\u901A\u9053");
    }
  } catch (e) {
    mark("vars-run", "fail", "\u53D8\u91CF\u5199\u5165\u5931\u8D25\uFF1A" + (e && e.message));
  }
  try {
    if (eng) {
      const st = eng._storeRead && eng._storeRead();
      mark("state-read", st ? "pass" : "warn", st ? "\u5DF2\u5B58\u4EBA\u683C\u53EF\u8BFB\u56DE" : "\u65E0\u5386\u53F2\u72B6\u6001\uFF08\u9996\u6B21\u8FD0\u884C\u6B63\u5E38\uFF09");
    }
  } catch (e) {
    mark("state-read", "warn", "\u56DE\u8BFB\u5F02\u5E38\uFF1A" + (e && e.message));
  }
  const fails = strip.filter((s) => s.kind === "fail").length;
  const warns = strip.filter((s) => s.kind === "warn").length;
  lastSelfCheck = {
    strip,
    fails,
    warns,
    durationMs: ms(),
    at: Date.now(),
    via: lastInjectVia || "",
    summary: fails === 0 && warns === 0 ? "\u5168\u90E8\u901A\u8FC7" : fails ? fails + " \u9879\u5F02\u5E38" : warns + " \u9879\u964D\u7EA7"
  };
  if (!silent) log2("\u5185\u90E8\u81EA\u68C0", lastSelfCheck.summary, lastSelfCheck.durationMs + "ms");
  return lastSelfCheck;
}
function selfCheckLine() {
  const s = lastSelfCheck || selfCheck(true);
  const icon = s.fails ? "\u274C" : s.warns ? "\u{1F7E1}" : "\u2705";
  return "\u81EA\u68C0" + icon + " " + s.summary + " \xB7 " + s.durationMs + "ms";
}
var prevSnapshot = null;
function personaSnapshot() {
  let eng = null;
  try {
    eng = getEngine();
  } catch (e) {
    return null;
  }
  if (!eng || !eng.af) return null;
  const a = eng.af;
  const dec = eng._dec || {};
  const snap = {
    dims: {
      v: a.v,
      a: a.a,
      s: a.s,
      u: a.u,
      ct: a.ct,
      bc: a.bc,
      c: a.c
    },
    mood: (() => {
      try {
        return eng.mood();
      } catch (e) {
        return "";
      }
    })(),
    intent: dec.intent || "observe",
    goal: eng.goals && eng.goals[0] ? eng.goals[0].txt : "",
    ep: eng.ep || 0,
    memories: eng.memories && eng.memories.length || 0,
    beliefs: eng.beliefs && eng.beliefs.length || 0,
    at: Date.now()
  };
  const delta = {};
  if (prevSnapshot) {
    for (const k in snap.dims) {
      delta[k] = snap.dims[k] - (prevSnapshot.dims[k] || 0);
    }
  }
  snap.delta = prevSnapshot ? delta : null;
  snap.prevAt = prevSnapshot ? prevSnapshot.at : null;
  prevSnapshot = { dims: Object.assign({}, snap.dims), at: snap.at };
  return snap;
}
var injected = false;
var lastInjectVia = "";
function injectViaNative(content, depth) {
  try {
    const c = getCtx();
    if (!c || typeof c.setExtensionPrompt !== "function") return false;
    c.setExtensionPrompt(PROMPT_ID, content, 1, depth);
    return true;
  } catch (e) {
    return false;
  }
}
function doInject(reason) {
  try {
    const e = getEngine();
    const p = e.profile || {};
    if (p.inject && p.inject.show === false) return;
    const content = e.inject();
    const depth = p.inject && p.inject.depth || 4;
    const role = p.inject && p.inject.role || "system";
    if (typeof injectPrompts === "function") {
      if (injected && typeof uninjectPrompts === "function") {
        try {
          uninjectPrompts([PROMPT_ID]);
        } catch (err) {
        }
      }
      injectPrompts(
        [{ id: PROMPT_ID, position: "in_chat", depth, role, content, should_scan: true }],
        { once: false }
      );
      injected = true;
      lastInjectVia = "tavernhelper";
      log2("\u5DF2\u6CE8\u5165" + (reason ? "(" + reason + ")" : ""), content.length + "\u5B57", "[\u9152\u9986\u52A9\u624B]");
      return;
    }
    if (injectViaNative(content, depth)) {
      injected = true;
      if (HEALTH.inject) HEALTH.inject.kind = "fallback";
      lastInjectVia = "native";
      log2("\u5DF2\u6CE8\u5165" + (reason ? "(" + reason + ")" : ""), content.length + "\u5B57", "[ST\u539F\u751F\u515C\u5E95]");
      return;
    }
    if (HEALTH.inject) HEALTH.inject.kind = "missing";
    lastInjectVia = "";
    log2("\u6CE8\u5165\u4E0D\u53EF\u7528\uFF0C\u8DF3\u8FC7\uFF08\u9152\u9986\u52A9\u624B\u4E0E ST \u539F\u751F\u901A\u9053\u5747\u7F3A\u5931\uFF09");
  } catch (e) {
    log2("\u6CE8\u5165\u5931\u8D25", e && e.message);
  }
}
function onEvent(name, fn) {
  try {
    if (typeof eventOn === "function") {
      eventOn(name, fn);
      return true;
    }
    const es = typeof eventSource !== "undefined" && eventSource || getCtx() && getCtx().eventSource;
    if (es && es.on) {
      es.on(name, fn);
      return true;
    }
  } catch (e) {
    log2("\u7ED1\u5B9A\u4E8B\u4EF6\u5931\u8D25 " + name, e && e.message);
  }
  return false;
}
var lastMsgKey = "";
function msgKey(id) {
  try {
    const arr = getChatMessages([id], { include_swipes: true });
    if (arr && arr[0]) {
      const m = arr[0];
      return id + "|" + String(m.message || "").slice(0, 64);
    }
  } catch (e) {
  }
  return String(id);
}
function msgText(id) {
  try {
    const arr = getChatMessages([id], { include_swipes: true });
    if (arr && arr[0]) {
      const m = arr[0];
      return String(m.message !== void 0 && m.message !== null ? m.message : "");
    }
  } catch (e) {
  }
  return "";
}
function onMsg(id, type) {
  try {
    if (type && type !== "normal" && type !== "swipe") return;
    const key = msgKey(id);
    if (key === lastMsgKey) return;
    lastMsgKey = key;
    const txt = msgText(id);
    if (!txt) return;
    const e = getEngine();
    e.evolve(txt, "char", charName() || "\u5BF9\u65B9", false);
    doInject("\u65B0\u6D88\u606F");
    const p = e.profile || {};
    if (p.toast_on_evolve) toast(p.meta && p.meta.name || "\u4EBA\u683C \xB7 " + e.mood());
  } catch (e) {
    log2("evolve \u5931\u8D25", e && e.stack || e && e.message);
  }
}
var lastPush = "";
function pushState(force) {
  try {
    const e = getEngine();
    const p = e.profile || {};
    if (!(p.mvu && p.mvu.enabled)) return false;
    const path = p.mvu.path || "persona_engine";
    const af = e.af || {};
    const snapshot = {
      mood: e.mood(),
      valence: Number((af.v || 0).toFixed(3)),
      arousal: Number((af.a || 0).toFixed(3)),
      safety: Number((af.s || 0).toFixed(3)),
      connection: Number((af.ct || 0).toFixed(3)),
      uncertainty: Number((af.u || 0).toFixed(3)),
      summary: e.afText()
    };
    const sig = JSON.stringify(snapshot);
    if (!force && sig === lastPush) return false;
    lastPush = sig;
    if (typeof insertOrAssignVariables === "function") {
      insertOrAssignVariables({ [path]: snapshot }, { type: "chat" });
      return true;
    }
    if (globalThis.TavernHelper && typeof globalThis.TavernHelper.insertOrAssignVariables === "function") {
      globalThis.TavernHelper.insertOrAssignVariables({ [path]: snapshot }, { type: "chat" });
      return true;
    }
  } catch (e) {
    log2("\u56DE\u5199\u72B6\u6001\u5931\u8D25", e && e.message);
  }
  return false;
}
var MACROS = [
  ["pe_mood", "\u5F53\u524D\u5FC3\u60C5", (e) => e.mood()],
  ["pe_feel", "\u4E03\u7EF4\u60C5\u611F\u5411\u91CF", (e) => e.afText()],
  ["pe_state", "\u5B8C\u6574\u5185\u5FC3\u72B6\u6001", (e) => e.fullState()],
  ["pe_person", "\u5BF9\u8EAB\u8FB9\u4EBA\u7684\u5224\u65AD", (e) => e.personText() || "(\u6682\u65E0)"],
  ["pe_goal", "\u6B64\u523B\u7684\u76EE\u6807", (e) => e.goalsText() || "(\u6682\u65E0)"],
  ["pe_line", "\u6B64\u523B\u4F1A\u8BF4\u51FA\u53E3\u7684\u8BDD", (e) => e._act0 && e._act0.line || "\u2026\u2026"]
];
function registerMacros() {
  const registered = [];
  for (const m of MACROS) {
    const key = m[0];
    const handler = m[2];
    let ok = false;
    try {
      if (typeof registerMacroLike === "function") {
        registerMacroLike(
          key,
          () => {
            try {
              return String(handler(getEngine()));
            } catch (err) {
              return "";
            }
          },
          key
        );
        ok = true;
      }
    } catch (e) {
      log2("\u6CE8\u518C\u5B8F\u5931\u8D25 " + key, e && e.message);
    }
    if (ok) registered.push(key);
  }
  if (registered.length) log2("\u5DF2\u6CE8\u518C\u52A9\u624B\u5B8F", registered.join(","));
}
var FOOT = "\u4EBA\u683C\u5F15\u64CE";
var CMDS = [
  ["pe-state", "\u67E5\u770B\u6B64\u523B\u7684\u5B8C\u6574\u5185\u5FC3\u72B6\u6001", (e) => e.fullState(), FOOT],
  ["pe-mood", "\u67E5\u770B\u6B64\u523B\u7684\u5FC3\u60C5", (e) => e.mood(), FOOT],
  ["pe-feel", "\u67E5\u770B\u4E03\u7EF4\u60C5\u611F\u5411\u91CF", (e) => e.afText(), FOOT],
  ["pe-person", "\u67E5\u770B\u5BF9\u8EAB\u8FB9\u4EBA\u7684\u5224\u65AD", (e) => e.personText() || "(\u6682\u65E0)", FOOT],
  ["pe-goal", "\u67E5\u770B\u6B64\u523B\u7684\u76EE\u6807", (e) => e.goalsText() || "(\u6682\u65E0)", FOOT],
  ["pe-refresh", "\u91CD\u65B0\u89E3\u6790 profile \u5E76\u91CD\u65B0\u6CE8\u5165", (e) => {
    getEngine(true);
    doInject("\u624B\u52A8\u5237\u65B0");
    pushState(true);
    return "\u5DF2\u5237\u65B0\uFF1A" + getEngine().mood();
  }, FOOT],
  ["pe-reset", "\u6E05\u7A7A\u8BB0\u5FC6\u4E0E\u72B6\u6001", (e) => {
    e.reset();
    doInject("\u91CD\u7F6E");
    pushState(true);
    return "\u72B6\u6001\u5DF2\u91CD\u7F6E\u3002";
  }, FOOT]
];
function registerCommands() {
  let ctx = null;
  try {
    ctx = getCtx();
  } catch (e) {
  }
  const Parser = ctx && ctx.SlashCommandParser || typeof SillyTavern !== "undefined" && SillyTavern.SlashCommandParser;
  const SC = ctx && ctx.SlashCommand || typeof SillyTavern !== "undefined" && SillyTavern.SlashCommand;
  const Arg = ctx && ctx.SlashCommandArgument || typeof SillyTavern !== "undefined" && SillyTavern.SlashCommandArgument;
  if (!Parser || !SC || typeof Parser.addCommandObject !== "function") {
    log2("SlashCommandParser \u4E0D\u53EF\u7528\uFF0C\u8DF3\u8FC7\u659C\u6760\u547D\u4EE4\u6CE8\u518C");
    return;
  }
  for (const c of CMDS) {
    const key = c[0];
    const desc = c[1];
    const run = c[2];
    try {
      const props = {
        name: key,
        helpString: desc,
        callback: async function() {
          try {
            const out = run(getEngine());
            return out === void 0 || out === null ? "" : String(out);
          } catch (e) {
            log2("\u659C\u6760 " + key + " \u51FA\u9519", e && e.message);
            return "";
          }
        }
      };
      if (Arg && Arg.fromProps) props.returns = Arg.fromProps({ description: desc, type: "string" });
      Parser.addCommandObject(SC.fromProps(props));
    } catch (e) {
      log2("\u6CE8\u518C\u659C\u6760 " + key + " \u5931\u8D25", e && e.message);
    }
  }
  log2("\u5DF2\u6CE8\u518C\u659C\u6760\u547D\u4EE4", CMDS.map((c) => "/" + c[0]).join(" "));
}
function exposeApi() {
  try {
    globalThis.personaEngine = {
      get: getEngine,
      profile: () => getProfile(true),
      state: () => getEngine().fullState(),
      mood: () => getEngine().mood(),
      feel: () => getEngine().afText(),
      reset: () => {
        const e = getEngine();
        e.reset();
        doInject("API\u91CD\u7F6E");
        pushState(true);
      },
      inject: () => doInject("API"),
      push: (force) => pushState(!!force),
      reload: () => getEngine(true),
      // 运行时自检：在浏览器 Console 里敲 personaEngine.health() 即可看到每一项软依赖状态
      health: () => probeRuntime(),
      healthLine: () => healthLine(),
      probe: () => probeRuntime(),
      injectVia: () => lastInjectVia,
      // 内部自检：在 Console 里敲 personaEngine.selfCheck() 就能让扩展「自证活着」
      selfCheck: (silent) => selfCheck(silent),
      selfCheckLine: () => selfCheckLine(),
      // 人格快照：直接读实时七维 + 情绪 + 倾向 + 目标，并给出与上一次的差值
      snapshot: () => personaSnapshot(),
      EXTENSION_ID,
      CARD_OVERRIDE_KEY,
      version: "0.2.0",
      panel: () => mountPanelWithRetry({
        probe: probeRuntime,
        healthLine,
        injectVia: () => lastInjectVia,
        selfCheck: (silent) => selfCheck(silent),
        selfCheckLine: () => selfCheckLine(),
        snapshot: () => personaSnapshot()
      })
    };
  } catch (e) {
    log2("\u5BFC\u51FA API \u5931\u8D25", e && e.message);
  }
}
function init() {
  const root = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : {};
  if (root.__persona_engine_booted) {
    log2("\u5DF2\u542F\u52A8\uFF0C\u8DF3\u8FC7\u91CD\u590D\u521D\u59CB\u5316");
    return;
  }
  root.__persona_engine_booted = true;
  const okMsg = onEvent("message_received", onMsg);
  if (!okMsg) onEvent("MESSAGE_RECEIVED", onMsg);
  const onChatChange = () => {
    try {
      lastMsgKey = "";
      injected = false;
      getEngine(true);
      doInject("\u5207\u6362\u804A\u5929");
    } catch (e) {
      log2("\u5207\u6362\u804A\u5929\u91CD\u6CE8\u5165\u5931\u8D25", e && e.message);
    }
  };
  onEvent("chat_id_changed", onChatChange);
  onEvent("CHAT_CHANGED", onChatChange);
  const onGen = () => {
    try {
      doInject("\u751F\u6210\u524D");
    } catch (e) {
    }
  };
  onEvent("generation_after_commands", onGen);
  onEvent("GENERATION_AFTER_COMMANDS", onGen);
  registerMacros();
  registerCommands();
  exposeApi();
  probeRuntime();
  try {
    getEngine(true);
    doInject("\u542F\u52A8");
    pushState(true);
  } catch (e) {
    log2("\u542F\u52A8\u6CE8\u5165\u5931\u8D25", e && e.message);
  }
  const hl = healthLine();
  toast("\u4EBA\u683C\u5F15\u64CE\u5DF2\u542F\u52A8 \xB7 " + hl, "\u4EBA\u683C\u5F15\u64CE");
  log2("\u5065\u5EB7\u68C0\u67E5", hl, "| \u6CE8\u5165\u901A\u9053:", lastInjectVia || "(\u672A\u6CE8\u5165)");
  mountPanelWithRetry({
    probe: probeRuntime,
    healthLine,
    injectVia: () => lastInjectVia,
    selfCheck: (silent) => selfCheck(silent),
    selfCheckLine: () => selfCheckLine(),
    snapshot: () => personaSnapshot(),
    refresh: () => {
      getEngine(true);
      doInject("\u9762\u677F\u91CD\u8F7D");
      pushState(true);
      toast("\u914D\u7F6E\u5DF2\u91CD\u8F7D", "\u4EBA\u683C\u5F15\u64CE");
    },
    forceInject: () => {
      injected = false;
      doInject("\u9762\u677F\u5F3A\u5236\u6CE8\u5165");
      toast("\u5DF2\u91CD\u65B0\u6CE8\u5165 \xB7 " + healthLine(), "\u4EBA\u683C\u5F15\u64CE");
    },
    reset: () => {
      const e = getEngine();
      e.reset();
      doInject("\u9762\u677F\u91CD\u7F6E");
      pushState(true);
      toast("\u72B6\u6001\u5DF2\u91CD\u7F6E", "\u4EBA\u683C\u5F15\u64CE");
    }
  });
  log2("\u542F\u52A8\u5B8C\u6210\u3002");
}
var integration_default = { init };
export {
  integration_default as default,
  init
};
