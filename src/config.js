/**
 * 人格引擎 · 配置解析
 *
 * 三级优先级（高 → 低）：
 *   1. 角色卡内变量（覆盖）
 *   2. 扩展私有变量（扩展设置面板 / 默认）
 *   3. 内置兜底默认（defaults.js）
 *
 * 合并策略是「深合并」：卡里只写 lines.belief_up，其余 key 仍用下层值。
 * 数组（events）例外：一旦上层提供，即整体替换（便于卡完全自定义事件表）。
 */

import { DEFAULT_PROFILE } from './defaults.js';

export const EXTENSION_ID = 'persona_engine';

/** 卡内覆盖变量使用的键名（写在角色卡/聊天的变量里） */
export const CARD_OVERRIDE_KEY = 'persona_engine_profile';

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/**
 * 深合并：base 为底，patch 覆盖。
 * - 普通对象递归合并
 * - 数组整体替换
 * - 其他类型直接覆盖
 */
export function deepMerge(base, patch) {
  if (patch === undefined) return base;
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

/** 安全调用 TavernHelper 的变量接口；未就绪时返回 undefined 而非抛错 */
function readVars(option) {
  try {
    const TH = globalThis.TavernHelper;
    if (!TH || typeof TH.getVariables !== 'function') return undefined;
    return TH.getVariables(option);
  } catch (e) {
    return undefined;
  }
}

function readWriteSafe(fn) {
  try {
    return fn();
  } catch (e) {
    return undefined;
  }
}

/**
 * 解析当前生效的 profile。
 * @param {{cardOverride?:object}} opts
 * @returns {object} 已合并、可用的 profile
 */
export function resolveProfile(opts = {}) {
  const fromExtension = readVars({ type: 'extension', extension_id: EXTENSION_ID }) || {};
  const extProfile = fromExtension.profile || {};

  // 卡内覆盖：优先用调用方显式传入的，其次从卡变量读
  let cardProfile = opts.cardOverride;
  if (cardProfile === undefined) {
    const fromCard =
      readVars({ type: 'character' }) || {};
    const fromChat = readVars({ type: 'chat' }) || {};
    cardProfile =
      fromChat[CARD_OVERRIDE_KEY] || fromCard[CARD_OVERRIDE_KEY] || {};
  }

  let merged = deepMerge(DEFAULT_PROFILE, extProfile);
  merged = deepMerge(merged, cardProfile);
  return merged;
}

/** 读取扩展自己的持久化状态（引擎运行数据，非配置） */
export function getExtensionState() {
  return readVars({ type: 'extension', extension_id: EXTENSION_ID }) || {};
}

/** 写回扩展状态 */
export function setExtensionState(values) {
  return readWriteSafe(() => {
    const TH = globalThis.TavernHelper;
    if (!TH || typeof TH.replaceVariables !== 'function') return false;
    TH.replaceVariables(values, { type: 'extension', extension_id: EXTENSION_ID });
    return true;
  });
}

export function updateExtensionState(updater) {
  return readWriteSafe(() => {
    const TH = globalThis.TavernHelper;
    if (!TH || typeof TH.updateVariablesWith !== 'function') return false;
    TH.updateVariablesWith(updater, { type: 'extension', extension_id: EXTENSION_ID });
    return true;
  });
}
