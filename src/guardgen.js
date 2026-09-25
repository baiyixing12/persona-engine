/**
 * 人格引擎 · 人设护栏生成器
 *
 * 目标（用户需求）：
 *   用户「主动粘贴角色人设原文」→ 调用酒馆的 AI 把它转成结构化的人设护栏 JSON
 *   → 内联进提示 → 全程约束模型不许写崩人设。
 *
 * 设计约束：
 *   - 通用：不为任何单张角色卡定制，任何卡粘进去都能用。
 *   - 一次到位：面板上最多一个「生成」按钮 + 一个 API 下拉，其余全自动。
 *   - 可选主/副 API：api 传 '' 走 ST 主 API；传预设名走 ST「代理预设」（副 API）。
 *   - 绝不抛异常打断主流程：所有失败都转成 { ok:false, error } 返回。
 *
 * 依赖：酒馆助手(JS-Slash-Runner) 暴露的
 *   TavernHelper.generateRaw(config)   —— 裸生成，不带酒馆预设，适合纯「转换」任务
 *   TavernHelper.getProxyPresetNames() —— 列出 ST「代理预设」名（供副 API 下拉）
 * 两者在扩展运行时可从 globalThis.TavernHelper 取到（见 JS-Slash-Runner src/function/index.ts）。
 */

const LOGTAG = '[人格引擎]';
function log(...a) {
  try {
    console.log.apply(console, [LOGTAG].concat([].slice.call(a)));
  } catch (e) {}
}

/** 取酒馆助手全局对象（不同版本挂法不一，逐个兜底） */
function TH() {
  try {
    if (typeof window !== 'undefined' && window.TavernHelper) return window.TavernHelper;
  } catch (e) {}
  try {
    if (typeof globalThis !== 'undefined' && globalThis.TavernHelper) return globalThis.TavernHelper;
  } catch (e) {}
  return null;
}

/** 酒馆助手是否具备「生成」能力（供面板显示/禁用按钮） */
export function canGenerate() {
  const t = TH();
  return !!(t && (typeof t.generateRaw === 'function' || typeof t.generate === 'function'));
}

/**
 * 列出可用于「副 API」的 ST 代理预设名。
 * 返回 ['默认（主 API）', ...预设名]，始终把主 API 放第一项。
 */
export function listApiOptions() {
  const out = ['默认（主 API）'];
  try {
    const t = TH();
    if (t && typeof t.getProxyPresetNames === 'function') {
      const names = t.getProxyPresetNames() || [];
      for (const n of names) {
        const s = String(n || '').trim();
        // 'None' 是 ST 自带的空预设，跳过；默认项已占位
        if (!s || s === 'None') continue;
        if (out.indexOf(s) < 0) out.push(s);
      }
    }
  } catch (e) {
    log('读取代理预设失败', e && e.message);
  }
  return out;
}

/**
 * 生成护栏用的提示词。
 * 用 generateRaw（不带酒馆预设）跑，因此这里必须自带完整的角色说明与格式要求。
 */
function buildPrompt(sourceText, charName) {
  const who = charName ? charName : '角色';
  return [
    '你是一个「角色人设结构化」工具。任务：把下面这段角色人设原文，转写成一份**结构化护栏 JSON**。',
    '',
    '护栏的用途：在角色扮演对话生成之前，把「这个角色无论如何都不能违背的东西」硬塞给模型，防止它为顺着剧情把人设写崩。',
    '',
    '请严格遵守以下规则：',
    '1. 只输出一个 JSON 对象，不要任何解释、不要 markdown 代码围栏、不要在 JSON 前后加字。',
    '2. JSON 的顶层键固定为：identity, voice, forbidden, drift_rules。',
    '3. identity：不可改的身份事实（年龄、身份、来历、关键经历、关系设定等）。字符串数组，0~6 条。',
    '4. voice：语气/说话方式的契约（句子长短、用词习惯、口癖、情绪表达方式等）。字符串数组，0~6 条。',
    '5. forbidden：绝对不能做的事（不许 OOC 的行为、不许说的台词、不许崩的底线）。字符串数组，0~6 条。',
    '6. drift_rules：状态触发式纠偏。数组，元素形如 {"when":"条件","then":"做法"}。',
    '   - when 必须用下面这套「短键比较式」，不要写中文句子：',
    '     v 心情 / a 张力 / s 安全感 / u 不确定 / c 信任 / ct 亲近 / bc 边界舒适',
    '     例："s < 0.30"、"a > 0.70"、"c > 0.60"。每个键的值域是 0~1。',
    '   - 只在人设原文里能明确推出「某种状态下该怎么纠偏」时才写，0~4 条；不确定就留空数组。',
    '7. 每条都写成**关于' + who + '的具体约束**，不要写泛泛的「保持角色」「不要 OOC」这类废话。',
    '8. 人设原文里没提到的，不要自己编；宁缺毋滥。',
    '9. 所有字符串内不要出现 {{char}} 之外的花括号模板语法；不要使用换行符。',
    '',
    '示例输出：',
    '{"identity":["17 岁，高二学生","幼时在旧城区长大"],"voice":["句子短，很少用感叹号","不主动解释自己的动机"],"forbidden":["不把痛苦当作换取同情的筹码","不会突然变得热情健谈"],"drift_rules":[{"when":"s < 0.30","then":"先退半步，不主动贴近"},{"when":"a > 0.70","then":"放慢语速，先确认对方意图"}]}',
    '',
    '=== 角色人设原文开始 ===',
    String(sourceText || '').trim(),
    '=== 角色人设原文结束 ===',
  ].join('\n');
}

/** 把模型返回的文本尽力解析成对象：容忍代码围栏、前后多余文字 */
function parseGuardJson(text) {
  let s = String(text == null ? '' : text).trim();
  if (!s) return null;
  // 去掉 ```json ... ``` 围栏
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence && fence[1]) s = fence[1].trim();
  // 直接解析
  try {
    return JSON.parse(s);
  } catch (e) {}
  // 截取第一个 { 到最后一个 }
  const a = s.indexOf('{');
  const b = s.lastIndexOf('}');
  if (a >= 0 && b > a) {
    try {
      return JSON.parse(s.slice(a, b + 1));
    } catch (e) {}
  }
  return null;
}

/** 归一化：只保留已知键，数组元素转字符串并去空、限长 */
function normalizeGuard(obj) {
  const arr = (v, max, maxLen) =>
    (Array.isArray(v) ? v : [])
      .map((x) => (typeof x === 'string' ? x : x == null ? '' : String(x)))
      .map((x) => x.replace(/[\r\n]+/g, ' ').trim())
      .filter(Boolean)
      .slice(0, max)
      .map((x) => (x.length > maxLen ? x.slice(0, maxLen) : x));
  const out = {
    identity: arr(obj && obj.identity, 8, 120),
    voice: arr(obj && obj.voice, 8, 120),
    forbidden: arr(obj && obj.forbidden, 8, 120),
    drift_rules: [],
  };
  const rules = Array.isArray(obj && obj.drift_rules) ? obj.drift_rules : [];
  for (const r of rules) {
    if (!r) continue;
    let when = typeof r.when === 'string' ? r.when : '';
    let then = typeof r.then === 'string' ? r.then : '';
    when = when.replace(/[\r\n]+/g, ' ').trim();
    then = then.replace(/[\r\n]+/g, ' ').trim();
    if (!when || !then) continue;
    // when 必须是「短键 比较 数字」形式，否则 evalCmp 不认，直接丢弃，避免死规则
    if (!/^\s*(v|a|s|u|c|ct|bc)\s*(<=|>=|<|>|==|!=)\s*[0-9.]+/.test(when)) continue;
    out.drift_rules.push({ when: when, then: then.slice(0, 120) });
    if (out.drift_rules.length >= 6) break;
  }
  return out;
}

/**
 * 主入口：把自然语言人设转成护栏对象。
 * @param {string} sourceText 用户粘贴的人设原文
 * @param {object} opts { api:'', model:'', charName:'' }
 *   api   -- '' 或 '默认（主 API）' 走主 API；否则为 ST 代理预设名（副 API）
 *   model -- 可选模型覆盖
 * @returns {Promise<{ok:boolean, guard?:object, raw?:string, error?:string}>}
 */
export async function generateGuard(sourceText, opts = {}) {
  const source = String(sourceText || '').trim();
  if (!source) return { ok: false, error: '人设原文为空，先粘贴内容再生成' };
  const t = TH();
  const gen = t && (typeof t.generateRaw === 'function' ? t.generateRaw : typeof t.generate === 'function' ? t.generate : null);
  if (!gen) {
    return { ok: false, error: '酒馆助手未就绪：找不到 generateRaw / generate（需 JS-Slash-Runner）' };
  }

  const api = String(opts.api || '').trim();
  const usePreset = api && api !== '默认（主 API）' && api !== '默认';

  // custom_api：指定代理预设即走副 API；未指定则完全不传，走 ST 当前主 API。
  const custom_api = {};
  if (usePreset) custom_api.proxy_preset = api;
  if (opts.model) custom_api.model = String(opts.model).trim();

  const config = {
    user_input: buildPrompt(source, opts.charName),
    should_silence: true, // 后台静默生成，不干扰当前对话流
    max_chat_history: 0, // 纯转换任务，不需要任何聊天上下文
    ordered_prompts: ['user_input'], // 只送这一条，避免带入酒馆预设/世界书
  };
  if (Object.keys(custom_api).length) config.custom_api = custom_api;
  // 结构化输出：能强制 JSON 的源会自动用 response_format / forced tool_choice
  config.json_schema = {
    name: 'persona_guard',
    strict: false,
    value: {
      type: 'object',
      properties: {
        identity: { type: 'array', items: { type: 'string' } },
        voice: { type: 'array', items: { type: 'string' } },
        forbidden: { type: 'array', items: { type: 'string' } },
        drift_rules: {
          type: 'array',
          items: {
            type: 'object',
            properties: { when: { type: 'string' }, then: { type: 'string' } },
            required: ['when', 'then'],
          },
        },
      },
      required: ['identity', 'voice', 'forbidden', 'drift_rules'],
    },
  };

  try {
    log('护栏生成中…', 'api=' + (usePreset ? api : '(主 API)'), 'len=' + source.length);
    const raw = await gen(config);
    const text = typeof raw === 'string' ? raw : raw && raw.text ? raw.text : String(raw == null ? '' : raw);
    const parsed = parseGuardJson(text);
    if (!parsed || typeof parsed !== 'object') {
      return { ok: false, raw: text, error: '模型返回的不是合法 JSON，可点「重试」或换个 API' };
    }
    const guard = normalizeGuard(parsed);
    const total = guard.identity.length + guard.voice.length + guard.forbidden.length + guard.drift_rules.length;
    if (!total) return { ok: false, raw: text, error: '模型没抽出任何有效条目，人设原文可能太短或太抽象' };
    return { ok: true, guard: guard, raw: text };
  } catch (e) {
    return { ok: false, error: '生成失败：' + ((e && e.message) || e) };
  }
}

export default { generateGuard, listApiOptions, canGenerate };
