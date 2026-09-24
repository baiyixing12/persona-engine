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
import { resolveProfile, EXTENSION_ID, CARD_OVERRIDE_KEY } from './config.js';

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

/* ---------------- 注入 ---------------- */
let injected = false;

function doInject(reason) {
  try {
    const e = getEngine();
    const p = e.profile || {};
    if (p.inject && p.inject.show === false) return;
    if (typeof injectPrompts !== 'function') {
      log('injectPrompts 不可用，跳过注入');
      return;
    }
    const content = e.inject();
    if (injected && typeof uninjectPrompts === 'function') {
      try {
        uninjectPrompts([PROMPT_ID]);
      } catch (err) {}
    }
    const depth = (p.inject && p.inject.depth) || 4;
    const role = (p.inject && p.inject.role) || 'system';
    injectPrompts(
      [{ id: PROMPT_ID, position: 'in_chat', depth, role, content, should_scan: true }],
      { once: false }
    );
    injected = true;
    log('已注入' + (reason ? '(' + reason + ')' : ''), content.length + '字');
  } catch (e) {
    log('注入失败', e && e.message);
  }
}

/* ---------------- 事件绑定 ---------------- */
function onEvent(name, fn) {
  try {
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
    if (typeof insertOrAssignVariables === 'function') {
      insertOrAssignVariables({ [path]: snapshot }, { type: 'chat' });
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
      EXTENSION_ID,
      CARD_OVERRIDE_KEY,
      version: '0.1.0',
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

  try {
    getEngine(true);
    doInject('启动');
    pushState(true);
  } catch (e) {
    log('启动注入失败', e && e.message);
  }
  log('启动完成。');
}

export default { init };
