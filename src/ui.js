/**
 * 人格引擎 · 扩展设置面板（UI 层）
 *
 * 目的：把运行时自检（HEALTH）从「只能翻 Console」变成「在扩展设置里直接看得见」。
 *
 * 设计约束：
 *   - 纯原生 DOM，不依赖 jQuery（不同 ST 版本 $ 可用性不一）。
 *   - 整个挂载过程包在 try 里，任何异常都不影响引擎主流程。
 *   - 挂载点优先 #extensions_settings2（扩展专属），退回 #extensions_settings。
 *   - 找不到挂载点（例如非 ST 环境 / 面板尚未渲染）时静默跳过，稍后可重试。
 *
 * 对外只暴露 mountPanel(deps)：deps 由 integration.js 注入，避免循环依赖。
 */

const LOGTAG = '[人格引擎]';
const PANEL_ID = 'persona_engine_panel';

function log(...a) {
  try {
    console.log.apply(console, [LOGTAG].concat([].slice.call(a)));
  } catch (e) {}
}

/** 找到扩展设置区的挂载容器；找不到返回 null */
function findSettingsHost() {
  if (typeof document === 'undefined') return null;
  // ST 把「扩展专属设置」放在 #extensions_settings2，#extensions_settings 为通用区
  return (
    document.querySelector('#extensions_settings2') ||
    document.querySelector('#extensions_settings') ||
    null
  );
}

/** 状态标记 → 文字/颜色的展示数据 */
function healthView(kind) {
  if (kind === 'ok') return { icon: '✅', text: '正常', cls: 'pe-ok' };
  if (kind === 'fallback') return { icon: '🟡', text: '降级', cls: 'pe-warn' };
  if (kind === 'missing') return { icon: '❌', text: '缺失', cls: 'pe-bad' };
  return { icon: '❔', text: '未知', cls: 'pe-unknown' };
}

const ROW_LABELS = {
  inject: '提示注入',
  events: '事件监听',
  macros: '助手宏',
  commands: '斜杠命令',
  vars: '变量通道',
};

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(PANEL_ID + '_style')) return;
  const style = document.createElement('style');
  style.id = PANEL_ID + '_style';
  style.textContent = [
    '#' + PANEL_ID + '{margin-top:6px;}',
    '#' + PANEL_ID + ' .pe-row{display:flex;align-items:center;gap:6px;font-size:0.86em;line-height:1.5;}',
    '#' + PANEL_ID + ' .pe-row .pe-name{min-width:5em;opacity:.85;}',
    '#' + PANEL_ID + ' .pe-row .pe-note{opacity:.6;font-size:0.92em;}',
    '#' + PANEL_ID + ' .pe-sum{margin:4px 0;font-size:0.9em;opacity:.9;}',
    '#' + PANEL_ID + ' .pe-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;}',
    '#' + PANEL_ID + ' button{margin:0;}',
  ].join('');
  document.head.appendChild(style);
}

/**
 * 渲染/刷新面板内容。
 * @param {HTMLElement} root 面板根节点
 * @param {object} deps 注入的依赖
 */
function renderPanel(root, deps) {
  const { probe, healthLine, injectVia, refresh, forceInject, reset } = deps;

  // 每次刷新重新探测，保证状态是「此刻」的
  let health = {};
  let line = '';
  let via = '';
  try {
    health = probe ? probe() || {} : {};
  } catch (e) {}
  try {
    line = healthLine ? healthLine() : '';
  } catch (e) {}
  try {
    via = injectVia ? injectVia() : '';
  } catch (e) {}

  // 清空重绘
  root.textContent = '';

  const title = document.createElement('div');
  title.className = 'pe-sum';
  const b = document.createElement('b');
  b.textContent = '状态自检';
  title.appendChild(b);
  title.appendChild(document.createTextNode(' · ' + (line || '(未探测)')));
  root.appendChild(title);

  for (const key of Object.keys(ROW_LABELS)) {
    const h = health[key];
    const v = healthView(h && h.kind);
    const row = document.createElement('div');
    row.className = 'pe-row ' + v.cls;

    const name = document.createElement('span');
    name.className = 'pe-name';
    name.textContent = ROW_LABELS[key];

    const icon = document.createElement('span');
    icon.textContent = v.icon + ' ' + v.text;

    const note = document.createElement('span');
    note.className = 'pe-note';
    note.textContent = (h && h.note) || '';

    row.appendChild(name);
    row.appendChild(icon);
    row.appendChild(note);
    root.appendChild(row);
  }

  const viaRow = document.createElement('div');
  viaRow.className = 'pe-sum';
  viaRow.textContent = '注入通道：' + (via || '(未注入)');
  root.appendChild(viaRow);

  // 操作按钮
  const btns = document.createElement('div');
  btns.className = 'pe-btns';

  const mkBtn = (label, fn) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'menu_button';
    btn.textContent = label;
    btn.addEventListener('click', () => {
      try {
        fn && fn();
      } catch (e) {
        log('面板操作失败 ' + label, e && e.message);
      }
      // 操作后立即刷新面板
      renderPanel(root, deps);
    });
    return btn;
  };

  btns.appendChild(mkBtn('重新检测', () => {}));
  if (refresh) btns.appendChild(mkBtn('重载配置', refresh));
  if (forceInject) btns.appendChild(mkBtn('强制注入', forceInject));
  if (reset) btns.appendChild(mkBtn('重置状态', reset));
  root.appendChild(btns);
}

/**
 * 挂载扩展设置面板。
 * @param {object} deps 依赖集合：
 *   { probe, healthLine, injectVia, refresh, forceInject, reset, version }
 * @returns {boolean} 是否成功挂载
 */
export function mountPanel(deps = {}) {
  try {
    injectStyles();
    const host = findSettingsHost();
    if (!host) {
      log('未找到扩展设置容器，面板跳过（不影响引擎）');
      return false;
    }

    let root = document.getElementById(PANEL_ID);
    if (!root) {
      // 用一个可折叠卡片，和 ST 其它扩展设置观感一致
      const details = document.createElement('div');
      details.className = 'extension_container';
      details.id = PANEL_ID;

      const header = document.createElement('div');
      header.className = 'inline-drawer';

      const toggle = document.createElement('div');
      toggle.className = 'inline-drawer-toggle inline-drawer-header';
      const hb = document.createElement('b');
      hb.textContent = '人格引擎';
      toggle.appendChild(hb);

      const bodyWrap = document.createElement('div');
      bodyWrap.className = 'inline-drawer-content';
      const body = document.createElement('div');
      body.className = 'pe-body';
      bodyWrap.appendChild(body);

      toggle.addEventListener('click', () => {
        details.classList.toggle('open');
      });

      header.appendChild(toggle);
      header.appendChild(bodyWrap);
      details.appendChild(header);

      // 默认展开（inline-drawer 未加 closed 即展开）
      details.classList.add('open');
      host.appendChild(details);
      root = details;
    }

    const body = root.querySelector('.pe-body') || root;
    renderPanel(body, deps);
    log('设置面板已挂载');
    return true;
  } catch (e) {
    log('挂载设置面板失败（不影响引擎）', e && e.message);
    return false;
  }
}

/** 若面板尚未挂载（ST 渲染较晚），做有限次重试 */
export function mountPanelWithRetry(deps = {}, tries = 5, delayMs = 1200) {
  if (mountPanel(deps)) return;
  let n = 0;
  const t = setInterval(() => {
    n += 1;
    if (mountPanel(deps) || n >= tries) clearInterval(t);
  }, delayMs);
}