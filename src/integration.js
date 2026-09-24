/**
 * 人格引擎 · 酒馆集成层
 *
 * 这一层负责把 engine.js 的核心状态机接到 SillyTavern / 酒馆助手(JS-Slash-Runner)上：
 *   - 事件监听（message_received / chat_id_changed / generation_after_commands）
 *   - 提示注入（injectPrompts）
 *   - 助手宏（registerMacroLike）
 *   - 斜杠命令（SlashCommandParser）
 *   - MVU / 卡内变量回写（可选）
 *
 * 与 v4 的区别：所有「希言」品牌化的命名都中性化成 pe_*，
 * 所有阈值/开关都从 profile 读，不写死任何角色专属内容。
 */

import { createEngine } from './engine.js';
import { ENGINE_VERSION } from './defaults.js';
import { resolveProfile, EXTENSION_ID, CARD_OVERRIDE_KEY } from './config.js';
import { mountPanelWithRetry } from './ui.js';

const LOGTAG = '[人格引擎]';
const PROMPT_ID = 'persona_engine_inject';

function log(...a) {
  try {
    console.log.apply(console, [LOGTAG].concat([].slice.call(a)));
  } catch (e) {}
}

function toast(msg, title) {
  try {
    if (typeof toastr !== 'undefined') {
      toastr.info(String(msg), String(title || '人格引擎'), { timeOut: 2200 });
    } else log(msg);
  } catch (e) {
    log(msg);
  }
}

/* ---------------- 上下文取值 ---------------- */
function getCtx() {
  try {
    if (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) return SillyTavern.getContext();
  } catch (e) {}
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
  } catch (e) {}
  return 'default';
}

function userName() {
  try {
    const c = getCtx();
    if (c && c.name1) return c.name1;
    if (c && c.name) return c.name;
  } catch (e) {}
  return '你';
}

function charName() {
  try {
    const c = getCtx();
    if (c && c.name2) return c.name2;
  } catch (e) {}
  return '';
}

/* ---------------- 引擎实例管理 ---------------- */
let engine = null;
let cachedProfile = null;

function getProfile(force) {
  if (cachedProfile && !force) return cachedProfile;
  try {
    cachedProfile = resolveProfile({});
  } catch (e) {
    log('解析 profile 失败，退回内置默认', e && e.message);
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
      meta: { name: charName(), user: userName() },
    });
  }
  return engine;
}

/* ---------------- 运行时自检 ---------------- */
/* 记录每个软依赖是否就绪，供状态面板 / 全局 API 读取。
   kind: 'ok' | 'fallback' | 'missing'
   - injectPrompts : 酒馆助手注入接口（缺失时回退 ST 原生 setExtensionPrompt）
   - registerMacroLike : 酒馆助手宏接口
   - eventOn / eventSource : 事件源（二选一即可）
   - SlashCommandParser : ST 原生斜杠命令解析器（ST 自带，通常可用）
   - TavernHelper : 变量读写通道                       */
const HEALTH = {};

function setHealth(key, kind, note) {
  HEALTH[key] = { kind, note: note || '', at: Date.now() };
}

function probeRuntime() {
  // 酒馆助手把 API 暴露在 window.TavernHelper.* 命名空间下（不是裸全局名！）。
  // 裸 injectPrompts/eventOn/registerMacroLike 只在「脚本 iframe」内经 predefine.js 拍平可用，
  // 普通扩展（含本扩展）必须走 window.TavernHelper.*，否则会误报 missing。
  const TH = (typeof window !== 'undefined' && window.TavernHelper) || (globalThis && globalThis.TavernHelper) || null;
  // 注入通道
  if (TH && typeof TH.injectPrompts === 'function') {
    setHealth('inject', 'ok', 'TavernHelper.injectPrompts @ 酒馆助手');
  } else if (typeof injectPrompts === 'function') {
    setHealth('inject', 'ok', 'injectPrompts @ 脚本作用域');
  } else if (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) {
    try {
      const c = SillyTavern.getContext();
      if (c && typeof c.setExtensionPrompt === 'function') setHealth('inject', 'fallback', 'ST 原生 setExtensionPrompt');
      else setHealth('inject', 'missing', '两条注入通道都不可用');
    } catch (e) {
      setHealth('inject', 'missing', '探测 setExtensionPrompt 出错');
    }
  } else {
    setHealth('inject', 'missing', 'injectPrompts 与 SillyTavern 均不可用');
  }
  // 事件通道
  if (TH && typeof TH.eventOn === 'function') setHealth('events', 'ok', 'TavernHelper.eventOn @ 酒馆助手');
  else if (typeof eventOn === 'function') setHealth('events', 'ok', 'eventOn @ 脚本作用域');
  else if ((typeof eventSource !== 'undefined' && eventSource) || (getCtx() && getCtx().eventSource)) setHealth('events', 'ok', 'eventSource.on @ ST');
  else setHealth('events', 'missing', '未找到事件源');
  // 宏通道
  if (TH && typeof TH.registerMacroLike === 'function') setHealth('macros', 'ok', 'TavernHelper.registerMacroLike @ 酒馆助手');
  else if (typeof registerMacroLike === 'function') setHealth('macros', 'ok', 'registerMacroLike @ 脚本作用域');
  else setHealth('macros', 'missing', '缺少 registerMacroLike（需酒馆助手）');
  // 斜杠命令（ST 原生）
  const _c = getCtx();
  const _p = (_c && _c.SlashCommandParser) || (typeof SillyTavern !== 'undefined' && SillyTavern.SlashCommandParser);
  if (_p && typeof _p.addCommandObject === 'function') setHealth('commands', 'ok', 'SlashCommandParser @ ST');
  else setHealth('commands', 'missing', '缺少 SlashCommandParser');
  // 变量通道（写入用 insertOrAssignVariables，读用 getVariables）
  const _hasVars = TH && (typeof TH.getVariables === 'function' || typeof TH.insertOrAssignVariables === 'function');
  if (_hasVars) setHealth('vars', 'ok', 'TavernHelper 变量接口 @ 酒馆助手');
  else if (globalThis.TavernHelper && typeof globalThis.TavernHelper.getVariables === 'function') setHealth('vars', 'ok', 'globalThis.TavernHelper.getVariables');
  else setHealth('vars', 'missing', '缺少 TavernHelper（变量无法持久化）');
  return HEALTH;
}

/** 一行式健康摘要，用于 toast / API：如 "注入✅ 事件✅ 宏✅ 命令✅ 变量✅" */
function healthLine() {
  const mark = (k) => {
    const h = HEALTH[k];
    if (!h) return '❔';
    return h.kind === 'ok' ? '✅' : h.kind === 'fallback' ? '🟡' : '❌';
  };
  return '注入' + mark('inject') + ' 事件' + mark('events') + ' 宏' + mark('macros') + ' 命令' + mark('commands') + ' 变量' + mark('vars');
}

/* ---------------- 内部自检（self-check） ----------------
 * 目的：不用翻 Console、不用敲外部命令，扩展自己就能回答「我还活着吗」。
 * selfCheck() 会真的动手跑一遍：探测软依赖 → 实例化引擎 → 读一次状态 → 试写一次变量。
 * 结果缓存到 lastSelfCheck，供面板与 API 直接读。
 * kind: 'pass' | 'warn' | 'fail'
 */
let lastSelfCheck = null;
const SELFCHECK_TTL_MS = 30000; // 30s 内缓存可信，过期强制重探（解「僵尸快照」）
function selfCheckStale() {
  if (!lastSelfCheck) return true;
  return (Date.now() - (lastSelfCheck.at || 0)) > SELFCHECK_TTL_MS;
}
function selfCheck(silent) {
  const strip = [];
  const mark = (id, kind, note) => strip.push({ id, kind, note: note || '' });
  const then = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  const ms = () => {
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    return Math.max(0, Math.round(now - then));
  };

  // 1) 软依赖
  try {
    probeRuntime();
  } catch (e) {
    mark('probe', 'fail', '探测抛出异常：' + (e && e.message));
  }
  const kindOf = (k) => (HEALTH[k] && HEALTH[k].kind) || 'missing';
  const dep = (k, label) => {
    const kk = kindOf(k);
    mark('dep:' + k, kk === 'ok' ? 'pass' : kk === 'fallback' ? 'warn' : 'fail', label + ' ' + kk);
  };
  dep('inject', '提示注入');
  dep('events', '事件监听');
  dep('macros', '助手宏');
  dep('commands', '斜杠命令');
  dep('vars', '变量通道');

  // 2) 引擎实例化 + 状态可读
  let eng = null;
  try {
    eng = getEngine();
    mark('engine', eng && eng.profile ? 'pass' : 'warn', eng ? '引擎已实例化 cid=' + eng.cid : '引擎为空');
  } catch (e) {
    mark('engine', 'fail', '实例化失败：' + (e && e.message));
  }

  // 3) 注入通道状态（纯读，不真注入 —— 「纯被动」原则）
  {
    const k = kindOf('inject');
    mark('inject-run', k === 'ok' ? 'pass' : k === 'fallback' ? 'warn' : 'fail',
      k === 'ok' ? '注入通道就绪（TavernHelper）' : k === 'fallback' ? '仅 ST 原生兜底' : '两条注入通道都不通');
  }
  // 4) 变量通道（纯读，不写）
  {
    const k = kindOf('vars');
    mark('vars-run', k === 'ok' ? 'pass' : k === 'warn' ? 'warn' : 'fail',
      k === 'ok' ? '变量接口就绪（TavernHelper）' : '变量通道缺失或降级');
  }

  // 5) 持久化状态回读（能不能把已存的人格读回来）
  try {
    if (eng) {
      const st = eng._storeRead && eng._storeRead();
      mark('state-read', st ? 'pass' : 'warn', st ? '已存人格可读回' : '无历史状态（首次运行正常）');
    }
  } catch (e) {
    mark('state-read', 'warn', '回读异常：' + (e && e.message));
  }

  const fails = strip.filter((s) => s.kind === 'fail').length;
  const warns = strip.filter((s) => s.kind === 'warn').length;
  lastSelfCheck = {
    strip,
    fails,
    warns,
    durationMs: ms(),
    at: Date.now(),
    via: lastInjectVia || '',
    summary: fails === 0 && warns === 0 ? '全部通过' : fails ? fails + ' 项异常' : warns + ' 项降级',
  };
  if (!silent) log('内部自检', lastSelfCheck.summary, lastSelfCheck.durationMs + 'ms');
  return lastSelfCheck;
}

/** 内部自检的一行摘要，用于面板标题：如 "自检✅ 全部通过 · 12ms" */
function selfCheckLine(force) {
  const s = (!lastSelfCheck || force || selfCheckStale()) ? selfCheck(true) : lastSelfCheck;
  const icon = s.fails ? '❌' : s.warns ? '🟡' : '✅';
  return '自检' + icon + ' ' + s.summary + ' · ' + s.durationMs + 'ms';
}

/* ---------------- 人格快照（供面板显示「人格变化」） ----------------
 * 直接读 engine 的实时值：七维 + 情绪词 + 倾向 + 目标。
 * 与上一次快照对比得出 ↑↓ 变化量，让「人格在怎么变」一眼可见。
 */
let prevSnapshot = null;
/** 轮次节点提交基线：每轮对话/生成结束后调用，delta 才有意义 */
function commitSnapshot() {
  try {
    const snap = personaSnapshot();
    if (snap) prevSnapshot = { dims: Object.assign({}, snap.dims), at: snap.at };
  } catch (e) {}
}
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
      v: a.v, a: a.a, s: a.s, u: a.u, ct: a.ct, bc: a.bc, c: a.c,
    },
    mood: (() => { try { return eng.mood(); } catch (e) { return ''; } })(),
    intent: dec.intent || 'observe',
    goal: eng.goals && eng.goals[0] ? eng.goals[0].txt : '',
    ep: eng.ep || 0,
    memories: (eng.memories && eng.memories.length) || 0,
    beliefs: (eng.beliefs && eng.beliefs.length) || 0,
    at: Date.now(),
  };
  // 与上次快照求差
  const delta = {};
  if (prevSnapshot) {
    for (const k in snap.dims) {
      delta[k] = snap.dims[k] - (prevSnapshot.dims[k] || 0);
    }
  }
  snap.delta = prevSnapshot ? delta : null;
  snap.prevAt = prevSnapshot ? prevSnapshot.at : null;
  // 不在每次读快照时覆盖基线（否则面板反复 open 会把 delta 冲成 0）；
  // 基线只在「轮次节点」更新，见 commitSnapshot()。
  return snap;
}

/* ---------------- 注入 ---------------- */
let injected = false;
let lastInjectVia = '';

/* 回退通道：ST 原生 setExtensionPrompt(id, value, position, depth)
   position 映射：in_chat → 1；此处只用于酒馆助手缺失时兜底。
   注意：setExtensionPrompt 的 signature 在不同 ST 版本略有差异，
   故整体包在 try 中，失败即视为不可用，绝不抛出。 */
function injectViaNative(content, depth) {
  try {
    const c = getCtx();
    if (!c || typeof c.setExtensionPrompt !== 'function') return false;
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
    const depth = (p.inject && p.inject.depth) || 4;
    const role = (p.inject && p.inject.role) || 'system';

    // 主通道：酒馆助手 injectPrompts（API 位于 window.TavernHelper.*，不是裸名）
    const TH = (typeof window !== 'undefined' && window.TavernHelper) || (globalThis && globalThis.TavernHelper) || null;
    const _inject = (TH && typeof TH.injectPrompts === 'function' && TH.injectPrompts) || (typeof injectPrompts === 'function' ? injectPrompts : null);
    const _uninject = (TH && typeof TH.uninjectPrompts === 'function' && TH.uninjectPrompts) || (typeof uninjectPrompts === 'function' ? uninjectPrompts : null);
    if (typeof _inject === 'function') {
      if (injected && typeof _uninject === 'function') {
        try {
          _uninject([PROMPT_ID]);
        } catch (err) {}
      }
      _inject(
        [{ id: PROMPT_ID, position: 'in_chat', depth, role, content, should_scan: true }],
        { once: false }
      );
      if (TH && typeof TH.injectPrompts === 'function') HEALTH.inject = { kind: 'ok', note: 'TavernHelper.injectPrompts @ 酒馆助手' };
      injected = true;
      lastInjectVia = 'tavernhelper';
      log('已注入' + (reason ? '(' + reason + ')' : ''), content.length + '字', '[酒馆助手]');
      return;
    }

    // 回退通道：ST 原生 setExtensionPrompt
    if (injectViaNative(content, depth)) {
      injected = true;
      if (HEALTH.inject) HEALTH.inject.kind = 'fallback';
      lastInjectVia = 'native';
      log('已注入' + (reason ? '(' + reason + ')' : ''), content.length + '字', '[ST原生兜底]');
      return;
    }

    // 两条路都不通
    if (HEALTH.inject) HEALTH.inject.kind = 'missing';
    lastInjectVia = '';
    log('注入不可用，跳过（酒馆助手与 ST 原生通道均缺失）');
  } catch (e) {
    log('注入失败', e && e.message);
  }
}

/* ---------------- 事件绑定 ---------------- */
function onEvent(name, fn) {
  try {
    const TH = (typeof window !== 'undefined' && window.TavernHelper) || (globalThis && globalThis.TavernHelper) || null;
    if (TH && typeof TH.eventOn === 'function') {
      TH.eventOn(name, fn);
      return true;
    }
    if (typeof eventOn === 'function') {
      eventOn(name, fn);
      return true;
    }
    const es = (typeof eventSource !== 'undefined' && eventSource) || (getCtx() && getCtx().eventSource);
    if (es && es.on) {
      es.on(name, fn);
      return true;
    }
  } catch (e) {
    log('绑定事件失败 ' + name, e && e.message);
  }
  return false;
}

/* 消息去重键：避免 swipe / 编辑导致同一事件被算两次 */
let lastMsgKey = '';

function msgKey(id) {
  try {
    const arr = getChatMessages([id], { include_swipes: true });
    if (arr && arr[0]) {
      const m = arr[0];
      return id + '|' + String(m.message || '').slice(0, 64);
    }
  } catch (e) {}
  return String(id);
}

function msgText(id) {
  try {
    const arr = getChatMessages([id], { include_swipes: true });
    if (arr && arr[0]) {
      const m = arr[0];
      return String(m.message !== undefined && m.message !== null ? m.message : '');
    }
  } catch (e) {}
  return '';
}

function onMsg(id, type) {
  try {
    if (type && type !== 'normal' && type !== 'swipe') return;
    const key = msgKey(id);
    if (key === lastMsgKey) return;
    lastMsgKey = key;
    const txt = msgText(id);
    if (!txt) return;
    const e = getEngine();
    e.evolve(txt, 'char', charName() || '对方', false);
    doInject('新消息');
    commitSnapshot(); // 轮次节点：把本轮结束时的七维提交为基线，面板 delta 才有参照
    const p = e.profile || {};
    if (p.toast_on_evolve) toast((p.meta && p.meta.name) || '人格' + ' · ' + e.mood());
  } catch (e) {
    log('evolve 失败', (e && e.stack) || (e && e.message));
  }
}

/* ---------------- 可选：状态回写卡内变量（供状态栏正则读取） ---------------- */
let lastPush = '';

function pushState(force) {
  try {
    const e = getEngine();
    const p = e.profile || {};
    if (!(p.mvu && p.mvu.enabled)) return false;
    const path = p.mvu.path || 'persona_engine';
    const af = e.af || {};
    const snapshot = {
      mood: e.mood(),
      valence: Number((af.v || 0).toFixed(3)),
      arousal: Number((af.a || 0).toFixed(3)),
      safety: Number((af.s || 0).toFixed(3)),
      connection: Number((af.ct || 0).toFixed(3)),
      uncertainty: Number((af.u || 0).toFixed(3)),
      summary: e.afText(),
    };
    const sig = JSON.stringify(snapshot);
    if (!force && sig === lastPush) return false;
    lastPush = sig;
    const _THi = (typeof window !== 'undefined' && window.TavernHelper) || (globalThis && globalThis.TavernHelper) || null;
    const _iav = (_THi && typeof _THi.insertOrAssignVariables === 'function' && _THi.insertOrAssignVariables) || (typeof insertOrAssignVariables === 'function' ? insertOrAssignVariables : null);
    if (typeof _iav === 'function') {
      _iav({ [path]: snapshot }, { type: 'chat' });
      return true;
    }
    if (globalThis.TavernHelper && typeof globalThis.TavernHelper.insertOrAssignVariables === 'function') {
      globalThis.TavernHelper.insertOrAssignVariables({ [path]: snapshot }, { type: 'chat' });
      return true;
    }
  } catch (e) {
    log('回写状态失败', e && e.message);
  }
  return false;
}

/* ---------------- 助手宏 ---------------- */
const MACROS = [
  ['pe_mood', '当前心情', (e) => e.mood()],
  ['pe_feel', '七维情感向量', (e) => e.afText()],
  ['pe_state', '完整内心状态', (e) => e.fullState()],
  ['pe_person', '对身边人的判断', (e) => e.personText() || '(暂无)'],
  ['pe_goal', '此刻的目标', (e) => e.goalsText() || '(暂无)'],
  ['pe_line', '此刻会说出口的话', (e) => (e._act0 && e._act0.line) || '……'],
];

function registerMacros() {
  const registered = [];
  for (const m of MACROS) {
    const key = m[0];
    const handler = m[2];
    let ok = false;
    try {
      if (typeof registerMacroLike === 'function') {
        registerMacroLike(
          key,
          () => {
            try {
              return String(handler(getEngine()));
            } catch (err) {
              return '';
            }
          },
          key
        );
        ok = true;
      }
    } catch (e) {
      log('注册宏失败 ' + key, e && e.message);
    }
    if (ok) registered.push(key);
  }
  if (registered.length) log('已注册助手宏', registered.join(','));
}

/* ---------------- 斜杠命令 ---------------- */
const FOOT = '人格引擎';

const CMDS = [
  ['pe-state', '查看此刻的完整内心状态', (e) => e.fullState(), FOOT],
  ['pe-mood', '查看此刻的心情', (e) => e.mood(), FOOT],
  ['pe-feel', '查看七维情感向量', (e) => e.afText(), FOOT],
  ['pe-person', '查看对身边人的判断', (e) => e.personText() || '(暂无)', FOOT],
  ['pe-goal', '查看此刻的目标', (e) => e.goalsText() || '(暂无)', FOOT],
  ['pe-refresh', '重新解析 profile 并重新注入', (e) => {
    getEngine(true);
    doInject('手动刷新');
    pushState(true);
    return '已刷新：' + getEngine().mood();
  }, FOOT],
  ['pe-reset', '清空记忆与状态', (e) => {
    e.reset();
    doInject('重置');
    pushState(true);
    return '状态已重置。';
  }, FOOT],
];

function registerCommands() {
  let ctx = null;
  try {
    ctx = getCtx();
  } catch (e) {}
  const Parser = (ctx && ctx.SlashCommandParser) || (typeof SillyTavern !== 'undefined' && SillyTavern.SlashCommandParser);
  const SC = (ctx && ctx.SlashCommand) || (typeof SillyTavern !== 'undefined' && SillyTavern.SlashCommand);
  const Arg = (ctx && ctx.SlashCommandArgument) || (typeof SillyTavern !== 'undefined' && SillyTavern.SlashCommandArgument);
  if (!Parser || !SC || typeof Parser.addCommandObject !== 'function') {
    log('SlashCommandParser 不可用，跳过斜杠命令注册');
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
        callback: async function () {
          try {
            const out = run(getEngine());
            return out === undefined || out === null ? '' : String(out);
          } catch (e) {
            log('斜杠 ' + key + ' 出错', e && e.message);
            return '';
          }
        },
      };
      if (Arg && Arg.fromProps) props.returns = Arg.fromProps({ description: desc, type: 'string' });
      Parser.addCommandObject(SC.fromProps(props));
    } catch (e) {
      log('注册斜杠 ' + key + ' 失败', e && e.message);
    }
  }
  log('已注册斜杠命令', CMDS.map((c) => '/' + c[0]).join(' '));
}

/* ---------------- 对外导出 ---------------- */
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
        doInject('API重置');
        pushState(true);
      },
      inject: () => doInject('API'),
      push: (force) => pushState(!!force),
      reload: () => getEngine(true),
      // 运行时自检：在浏览器 Console 里敲 personaEngine.health() 即可看到每一项软依赖状态
      health: () => probeRuntime(),
      healthLine: () => healthLine(),
      probe: () => probeRuntime(),
      injectVia: () => lastInjectVia,
      // 内部自检：在 Console 里敲 personaEngine.selfCheck() 就能让扩展「自证活着」
      selfCheck: (silent) => selfCheck(silent),
      selfCheckLine: (force) => selfCheckLine(force),
      // 人格快照：直接读实时七维 + 情绪 + 倾向 + 目标，并给出与上一次的差值
      snapshot: () => personaSnapshot(),
      EXTENSION_ID,
      CARD_OVERRIDE_KEY,
      version: ENGINE_VERSION,
      panel: () => mountPanelWithRetry({
        probe: probeRuntime,
        healthLine,
        injectVia: () => lastInjectVia,
        selfCheck: (silent) => selfCheck(silent),
        selfCheckLine: () => selfCheckLine(),
        snapshot: () => personaSnapshot(),
      }),
    };
  } catch (e) {
    log('导出 API 失败', e && e.message);
  }
}

/* ---------------- 启动 ---------------- */
export function init() {
  const root = typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : {};
  if (root.__persona_engine_booted) {
    log('已启动，跳过重复初始化');
    return;
  }
  root.__persona_engine_booted = true;

  const okMsg = onEvent('message_received', onMsg);
  if (!okMsg) onEvent('MESSAGE_RECEIVED', onMsg);

  const onChatChange = () => {
    try {
      lastMsgKey = '';
      injected = false;
      getEngine(true);
      doInject('切换聊天');
    } catch (e) {
      log('切换聊天重注入失败', e && e.message);
    }
  };
  onEvent('chat_id_changed', onChatChange);
  onEvent('CHAT_CHANGED', onChatChange);

  const onGen = () => {
    try {
      doInject('生成前');
    } catch (e) {}
  };
  onEvent('generation_after_commands', onGen);
  onEvent('GENERATION_AFTER_COMMANDS', onGen);

  registerMacros();
  registerCommands();
  exposeApi();

  // 运行时自检：探测所有软依赖，把结果摊开给用户看（不再静默跳过）
  probeRuntime();

  try {
    getEngine(true);
    doInject('启动');
    pushState(true);
  } catch (e) {
    log('启动注入失败', e && e.message);
  }

  // 启动回执：手机上看不到 Console，所以用 toast 把「到底哪条链路活了」直接顶到脸上
  const hl = healthLine();
  toast('人格引擎已启动 · ' + hl, '人格引擎');
  log('健康检查', hl, '| 注入通道:', lastInjectVia || '(未注入)');

  // 扩展设置面板：把同一份自检结果显示到 Extensions 界面里（找不到容器会自动重试）
  mountPanelWithRetry({
    probe: probeRuntime,
    healthLine,
    injectVia: () => lastInjectVia,
    selfCheck: (silent) => selfCheck(silent),
    selfCheckLine: () => selfCheckLine(),
    snapshot: () => personaSnapshot(),
    refresh: () => {
      getEngine(true);
      doInject('面板重载');
      pushState(true);
      toast('配置已重载', '人格引擎');
    },
    forceInject: () => {
      injected = false;
      doInject('面板强制注入');
      toast('已重新注入 · ' + healthLine(), '人格引擎');
    },
    reset: () => {
      const e = getEngine();
      e.reset();
      doInject('面板重置');
      pushState(true);
      toast('状态已重置', '人格引擎');
    },
  });

  log('启动完成。');
}

export default { init };
