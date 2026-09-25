// src/defaults.js
var ENGINE_VERSION = "0.5.0";
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
    /* 分带表：高阈值名 / 低阈值名 / 中间中性名（neutral）。
       neutral 可省略，省略则中间带输出空串。 */
    valence: { warm: 0.25, cold: -0.25, neutral: "\u5E73\u9759" },
    arousal: { tense: 0.65, relaxed: 0.3, neutral: "\u5E73\u7A33" },
    safety: { safe: 0.6, unsafe: 0.35, neutral: "\u5C1A\u53EF" }
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
  /* ---------- 初始姿态（reset() 读它；角色卡可覆盖）---------- */
  initial: {
    /* 七维起点：中性略偏稳，不预设任何情绪基调。
       v>=-0.25 不为 cold；s>=0.35 不为 unsafe。 */
    af: { v: 0.15, a: 0.25, s: 0.5, u: 0.35, c: 0.2, ct: 0.3, bc: 0.3 },
    self: { esteem: 0.3, efficacy: 0.3, coherence: 0.5 }
  },
  /* ---------- 人设护栏（事前约束） ----------
   * 与 inject 的区别：inject 说的是「此刻的内心状态」，是事后如实汇报；
   * persona_guard 说的是「你无论如何都必须守住的东西」，是生成前的硬约束。
   * 它在正文生成之前注入，用来防止模型为了顺着剧情把人设写崩。
   *
   * 结构：
   *   enabled      -- 总开关
   *   identity[]   -- 不可改的身份事实（如 '17岁，高二'）
   *   voice[]      -- 语气契约（如 '句子短'、'不解释自己'）
   *   forbidden[]  -- 绝对禁止（如 '不把痛苦当筹码'）
   *   drift_rules[]-- 状态触发式纠偏：{ when:'维度比较式', then:'做法' }
   *                   when 里的维度名沿用 af 的短键，与 mood.rules 同一套求值器：
   *                   v 心情 / a 张力 / s 安全感 / u 不确定 / c 连接 / ct 亲近 / bc 边界舒适
   *                   例：{ when:'s < 0.30', then:'先退半步，不主动贴近' }
   *   header/footer-- 段落包装文本（{{char}} 会被替换）
   *   always       -- 是否总是输出 identity/voice/forbidden（drift 命中项另行追加）
   */
  persona_guard: {
    // 默认开：配合 guard() 的「空内容短路」，没内容时不会产生任何注入噪音，
    // 因此可以安全地对所有卡默认打开；用户粘一次人设就立刻生效。
    enabled: true,
    always: true,
    header: "\u3010\u4EBA\u8BBE\u62A4\u680F\u3011\u4EE5\u4E0B\u662F{{char}}\u5728\u4EFB\u4F55\u60C5\u51B5\u4E0B\u90FD\u4E0D\u80FD\u8FDD\u80CC\u7684\u8BBE\u5B9A\uFF0C\u4F18\u5148\u7EA7\u9AD8\u4E8E\u5267\u60C5\u63A8\u8FDB\u7684\u4FBF\u5229\u3002\n",
    footer: "\n\uFF08\u82E5\u4E0A\u6587\u4E0E\u6B64\u5904\u51B2\u7A81\uFF0C\u4EE5\u6B64\u5904\u4E3A\u51C6\u3002\uFF09",
    identity: [],
    voice: [],
    forbidden: [],
    drift_rules: [],
    /* ---------- 护栏生成器（把自然语言人设转成上面的结构化护栏） ----------
     * source    -- 用户粘贴的人设原文（仅作留档，方便二次生成/对照）
     * api       -- 用哪个 API 生成：'' = ST 主 API；其它 = ST「代理预设」名（副 API）
     * model     -- 可选，覆盖模型名（留空则用所选 API 默认模型）
     * at        -- 上次生成时间戳（0 表示从未生成过）
     */
    gen: {
      source: "",
      api: "",
      model: "",
      at: 0
    }
  },
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
    const TH2 = globalThis.TavernHelper;
    if (!TH2 || typeof TH2.getVariables !== "function") return void 0;
    return TH2.getVariables(option);
  } catch (e) {
    return void 0;
  }
}
function readWriteSafe(fn) {
  try {
    return fn();
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
function getExtensionState() {
  return readVars({ type: "extension", extension_id: EXTENSION_ID }) || {};
}
function updateExtensionState(updater) {
  return readWriteSafe(() => {
    const TH2 = globalThis.TavernHelper;
    if (!TH2 || typeof TH2.updateVariablesWith !== "function") return false;
    TH2.updateVariablesWith(updater, { type: "extension", extension_id: EXTENSION_ID });
    return true;
  });
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
    const I = this.profile.initial || {};
    const af = I.af || {};
    const sf = I.self || {};
    this.af = {
      v: num(af.v, 0.15),
      // valence 情绪效价（0.15 落「中性」带，不再一上来就 cold）
      a: num(af.a, 0.25),
      // arousal 张力（<0.3 → relaxed）
      s: num(af.s, 0.5),
      // safety 安全感（>=0.35 → 不再是 unsafe）
      u: num(af.u, 0.35),
      // uncertainty 不确定
      c: num(af.c, 0.2),
      // connection 连接
      ct: num(af.ct, 0.3),
      // attach 依恋
      bc: num(af.bc, 0.3)
      // boundary-comfort 边界舒适
    };
    this.self = {
      esteem: num(sf.esteem, 0.3),
      efficacy: num(sf.efficacy, 0.3),
      coherence: num(sf.coherence, 0.5)
    };
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
      const TH2 = globalThis.TavernHelper;
      if (TH2 && typeof TH2.getVariables === "function") {
        const v = TH2.getVariables({ type: "script" });
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
      const TH2 = globalThis.TavernHelper;
      if (TH2 && typeof TH2.insertOrAssignVariables === "function") {
        TH2.insertOrAssignVariables({ [this.key]: obj }, { type: "script" });
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
    const vd = pickBand(a.v, L.valence || { warm: 0.25, cold: -0.25, neutral: "\u5E73\u9759" });
    const ad = pickBand(a.a, L.arousal || { tense: 0.65, relaxed: 0.3, neutral: "\u5E73\u7A33" });
    const sd = pickBand(a.s, L.safety || { safe: 0.6, unsafe: 0.35, neutral: "\u5C1A\u53EF" });
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
  /**
   * 人设护栏（事前约束）。
   *
   * 与 fullState() 的分工：
   *   fullState() —— 描述「此刻我正处于什么状态」，供模型参考语气；
   *   guard()     —— 规定「无论什么状态、你都不许违反什么」，供模型遵守。
   * 后者在正文生成之前注入，用来防止模型顺着剧情把人设写崩。
   *
   * 返回空串表示不加护栏（未启用 / 没有任何内容）。
   * 条件式纠偏复用 mood.rules 同一套 evalCmp 求值器，维度键沿用 af 短键。
   */
  guard() {
    const G = this.profile.persona_guard;
    if (!G || G.enabled === false) return "";
    const L = [];
    const tctx = this.tctx;
    const list = (arr, bullet, inline) => (Array.isArray(arr) ? arr : []).map((x) => typeof x === "string" ? x.trim() : "").filter(Boolean).map((x) => tpl(x, tctx)).map((x) => bullet == null ? x : bullet + x);
    const always = G.always !== false;
    if (always) {
      const id = list(G.identity, "- ");
      if (id.length) L.push("\u8EAB\u4EFD\uFF08\u4E0D\u53EF\u6539\uFF09\uFF1A\n" + id.join("\n"));
      const vc = list(G.voice, "- ");
      if (vc.length) L.push("\u8BED\u6C14\uFF08\u5FC5\u987B\u4FDD\u6301\uFF09\uFF1A\n" + vc.join("\n"));
      const fb = list(G.forbidden, "- ");
      if (fb.length) L.push("\u7981\u6B62\uFF08\u4EFB\u4F55\u60C5\u51B5\u90FD\u4E0D\u8BB8\uFF09\uFF1A\n" + fb.join("\n"));
    }
    const rules = Array.isArray(G.drift_rules) ? G.drift_rules : [];
    const hit = [];
    for (const r of rules) {
      if (!r || typeof r.when !== "string" || typeof r.then !== "string") continue;
      let m = true;
      try {
        m = evalCmp({ cmp: r.when }, this.af);
      } catch (e) {
        m = false;
      }
      if (m) hit.push("- \u5F53" + r.when.replace(/\s+/g, "") + "\u65F6\uFF1A" + tpl(r.then, tctx));
    }
    if (hit.length) L.push("\u6B64\u523B\u7684\u7EA0\u6B63\uFF1A\n" + hit.join("\n"));
    if (!L.length) return "";
    const head = tpl(G.header || "", this.tctx);
    const tail = tpl(G.footer || "", this.tctx);
    return head + L.join("\n") + tail;
  }
  /** 注入正文：头/尾/角色名全部来自 profile.inject */
  inject() {
    const d = this.fullState();
    const I = this.profile.inject || {};
    const head = tpl(I.header || "\u3010\u5185\u5FC3\u3011\u4EE5\u4E0B\u662F{{char}}\u6B64\u523B\u6CA1\u6709\u8BF4\u51FA\u53E3\u7684\u5185\u5FC3\u72B6\u6001\uFF0C\u53EA\u80FD\u7528\u6765\u51B3\u5B9A\u8BED\u6C14\u3001\u52A8\u4F5C\u4E0E\u53CD\u5E94\uFF1B\u4E0D\u8981\u76F4\u63A5\u590D\u8FF0\u3002\n", this.tctx);
    const tail = tpl(I.footer || "", this.tctx);
    const g = this.guard();
    return (g ? g + "\n\n" : "") + head + d + tail;
  }
};
function num(v, d) {
  return typeof v === "number" && isFinite(v) ? v : d;
}
function pickBand(v, table) {
  const entries = Object.entries(table).filter(([, t]) => typeof t === "number");
  if (!entries.length) return table.neutral || "";
  entries.sort((a, b) => b[1] - a[1]);
  const hi = entries[0];
  const lo = entries[entries.length - 1];
  if (entries.length === 1) return v >= hi[1] ? hi[0] : table.neutral || lo[0];
  if (v >= hi[1]) return hi[0];
  if (v < lo[1]) return lo[0];
  return table.neutral || "";
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
var GEN_CACHE = { src: "", out: "", api: "" };
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
  const num2 = document.createElement("span");
  num2.className = "pe-dimval";
  num2.textContent = typeof val === "number" ? val.toFixed(2) : "\u2014";
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
  row.appendChild(num2);
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
    "#" + PANEL_ID + " .pe-flat{opacity:.35;}",
    "#" + PANEL_ID + " .pe-head{display:flex;align-items:center;gap:8px;padding:5px 8px;margin:0 0 6px;}",
    "#" + PANEL_ID + " .pe-head{border:1px solid rgba(128,128,128,.35);border-radius:4px;background:rgba(128,128,128,.08);}",
    "#" + PANEL_ID + " .pe-head{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.06em;}",
    "#" + PANEL_ID + " .pe-name{font-weight:700;font-size:0.86em;opacity:.92;}",
    "#" + PANEL_ID + " .pe-ver{font-size:0.78em;opacity:.6;font-variant-numeric:tabular-nums;}",
    "#" + PANEL_ID + " .pe-led{width:8px;height:8px;border-radius:50%;flex:0 0 auto;background:#8a8a8a;}",
    "#" + PANEL_ID + " .pe-led.pe-on{background:#4ec46f;box-shadow:0 0 6px #4ec46f;}",
    "#" + PANEL_ID + " .pe-led.pe-off{background:#6d6d6d;}",
    "#" + PANEL_ID + " .pe-led.pe-warn{background:#e0b24a;box-shadow:0 0 6px #e0b24a;animation:pe-blink 1.1s ease-in-out infinite;}",
    "#" + PANEL_ID + " .pe-led.pe-err{background:#e0534a;box-shadow:0 0 6px #e0534a;animation:pe-blink .8s ease-in-out infinite;}",
    "#" + PANEL_ID + " .pe-chip{margin-left:auto;font-size:0.74em;padding:1px 7px;border-radius:9px;border:1px solid rgba(128,128,128,.45);opacity:.9;}",
    "#" + PANEL_ID + " .pe-chip.pe-guard-on{color:#4ec46f;border-color:rgba(78,196,111,.6);}",
    "#" + PANEL_ID + " .pe-chip.pe-guard-off{color:#9a9a9a;}",
    "#" + PANEL_ID + " .pe-guardtext{font-size:0.8em;opacity:.85;line-height:1.5;white-space:pre-wrap;}",
    "#" + PANEL_ID + " .pe-guardraw{margin:2px 0 4px;}",
    "#" + PANEL_ID + " .pe-guardraw>summary{cursor:pointer;font-size:0.8em;opacity:.8;}",
    // 人设护栏生成器
    "#" + PANEL_ID + " .pe-gen{margin:6px 0 2px;border-top:1px dashed rgba(128,128,128,.3);padding-top:6px;}",
    "#" + PANEL_ID + " .pe-gentitle{font-size:0.86em;font-weight:700;opacity:.92;margin-bottom:4px;}",
    "#" + PANEL_ID + " .pe-genrow{display:flex;align-items:center;gap:6px;margin:4px 0;font-size:0.82em;flex-wrap:wrap;}",
    "#" + PANEL_ID + " .pe-genrow label{opacity:.85;}",
    "#" + PANEL_ID + " .pe-gen textarea{width:100%;min-height:72px;box-sizing:border-box;font-size:0.84em;line-height:1.45;resize:vertical;font-family:inherit;}",
    "#" + PANEL_ID + " .pe-gen select{font-size:0.84em;max-width:100%;}",
    "#" + PANEL_ID + " .pe-gen .pe-out{width:100%;min-height:90px;box-sizing:border-box;font-size:0.8em;line-height:1.45;resize:vertical;font-family:ui-monospace,Menlo,Consolas,monospace;}",
    "#" + PANEL_ID + " .pe-note.pe-warn{color:#e0b24a;opacity:.95;}",
    "#" + PANEL_ID + " .pe-note.pe-ok{color:#4ec46f;opacity:.95;}",
    "#" + PANEL_ID + " .pe-note.pe-bad{color:#e0534a;opacity:.95;}",
    "@keyframes pe-blink{0%,100%{opacity:1;}50%{opacity:.35;}}"
  ].join("");
  document.head.appendChild(style);
}
function renderHead(root, deps) {
  try {
    const health = deps && deps.health || {};
    const version = deps && deps.version || "";
    const head = document.createElement("div");
    head.className = "pe-head";
    const led = document.createElement("span");
    led.className = "pe-led";
    const kinds = Object.keys(health).map((k) => health[k] && health[k].kind);
    if (!kinds.length) led.classList.add("pe-off");
    else if (kinds.indexOf("missing") >= 0) led.classList.add("pe-err");
    else if (kinds.indexOf("fallback") >= 0) led.classList.add("pe-warn");
    else led.classList.add("pe-on");
    head.appendChild(led);
    const name = document.createElement("span");
    name.className = "pe-name";
    name.textContent = "PERSONA ENGINE";
    head.appendChild(name);
    if (version) {
      const ver = document.createElement("span");
      ver.className = "pe-ver";
      ver.textContent = "v" + version;
      head.appendChild(ver);
    }
    const chip = document.createElement("span");
    const on = !!(deps && deps.guardOn && deps.guardOn());
    chip.className = "pe-chip " + (on ? "pe-guard-on" : "pe-guard-off");
    chip.textContent = on ? "GUARD ON" : "GUARD OFF";
    head.appendChild(chip);
    root.appendChild(head);
  } catch (e) {
  }
}
function renderGuard(root, deps) {
  try {
    const g = deps && deps.guard ? deps.guard() : "";
    const on = !!(deps && deps.guardOn && deps.guardOn());
    const box = document.createElement("div");
    box.className = "pe-guardraw";
    if (!on) {
      const hint = document.createElement("div");
      hint.className = "pe-hint";
      hint.textContent = "\u4EBA\u8BBE\u62A4\u680F\u5DF2\u5173\u95ED \xB7 \u53EF\u7528\u4E0B\u65B9\u300C\u751F\u6210\u5668\u300D\u65C1\u7684\u5F00\u5173\u952E\u91CD\u65B0\u6253\u5F00";
      box.appendChild(hint);
      root.appendChild(box);
      return;
    }
    const profile = deps && deps.profile ? deps.profile() : null;
    const pg = profile && profile.persona_guard || {};
    const cnt = (a) => Array.isArray(a) ? a.length : 0;
    const chips = document.createElement("div");
    chips.className = "pe-sum";
    const b = document.createElement("b");
    b.textContent = "\u4EBA\u8BBE\u62A4\u680F";
    chips.appendChild(b);
    chips.appendChild(document.createTextNode(" \xB7 \u8EAB\u4EFD" + cnt(pg.identity) + " / \u8BED\u6C14" + cnt(pg.voice) + " / \u7981\u6B62" + cnt(pg.forbidden) + " / \u6F02\u79FB" + cnt(pg.drift_rules)));
    box.appendChild(chips);
    const det = document.createElement("details");
    const sum = document.createElement("summary");
    sum.textContent = "ON \xB7 " + (g ? g.length : 0) + " \u5B57\u7B26";
    det.appendChild(sum);
    const pre = document.createElement("div");
    pre.className = "pe-guardtext";
    pre.textContent = g || "(\u7A7A)";
    det.appendChild(pre);
    box.appendChild(det);
    root.appendChild(box);
  } catch (e) {
  }
}
function renderGuardGen(root, deps) {
  try {
    const can = !!(deps && deps.canGenerate && deps.canGenerate());
    const box = document.createElement("div");
    box.className = "pe-gen pe-sec";
    const title = document.createElement("div");
    title.className = "pe-gentitle";
    title.textContent = "\u4EBA\u8BBE\u62A4\u680F\u751F\u6210\u5668";
    box.appendChild(title);
    const on = !!(deps && deps.guardOn && deps.guardOn());
    const swRow = document.createElement("div");
    swRow.className = "pe-genrow";
    const swLabel = document.createElement("label");
    swLabel.textContent = "\u62A4\u680F\u5F00\u5173\uFF1A";
    const swBtn = document.createElement("button");
    swBtn.type = "button";
    swBtn.className = "menu_button";
    swBtn.textContent = on ? "\u5DF2\u5F00\u542F\uFF08\u70B9\u51FB\u5173\u95ED\uFF09" : "\u5DF2\u5173\u95ED\uFF08\u70B9\u51FB\u5F00\u542F\uFF09";
    swBtn.addEventListener("click", () => {
      try {
        if (deps && deps.setGuardOn) deps.setGuardOn(!on);
      } catch (e) {
        log("\u5207\u6362\u62A4\u680F\u5F00\u5173\u5931\u8D25", e && e.message);
      }
      if (deps && deps.rerender) deps.rerender();
    });
    swRow.appendChild(swLabel);
    swRow.appendChild(swBtn);
    box.appendChild(swRow);
    if (!can) {
      const note = document.createElement("div");
      note.className = "pe-note pe-warn";
      note.textContent = "\u751F\u6210\u5668\u4E0D\u53EF\u7528\uFF1A\u672A\u63A2\u6D4B\u5230 TavernHelper.generateRaw / generate\uFF08\u9700\u8981\u9152\u9986\u52A9\u624B JS-Slash-Runner\uFF09\u3002\u53EF\u624B\u52A8\u5728\u53D8\u91CF\u91CC\u5199 persona_guard\u3002";
      box.appendChild(note);
      root.appendChild(box);
      return;
    }
    const srcRow = document.createElement("div");
    srcRow.className = "pe-genrow";
    const srcLabel = document.createElement("label");
    srcLabel.textContent = "\u7C98\u8D34\u89D2\u8272\u4EBA\u8BBE\u539F\u6587\uFF1A";
    srcRow.appendChild(srcLabel);
    box.appendChild(srcRow);
    const src = document.createElement("textarea");
    src.placeholder = "\u628A\u89D2\u8272\u7684\u8BBE\u5B9A/\u63CF\u8FF0\u539F\u6587\u6574\u6BB5\u7C98\u8D34\u5230\u8FD9\u91CC\u3002\u751F\u6210\u5668\u4F1A\u628A\u5B83\u8F6C\u6210\u7ED3\u6784\u5316\u62A4\u680F\uFF08\u8EAB\u4EFD/\u8BED\u6C14/\u7981\u6B62/\u6F02\u79FB\u89C4\u5219\uFF09\uFF0C\u7528\u4E8E\u751F\u6210\u524D\u7EA6\u675F\u6A21\u578B\u4E0D\u5199\u5D29\u4EBA\u8BBE\u3002";
    src.value = GEN_CACHE.src || "";
    src.addEventListener("input", () => {
      GEN_CACHE.src = src.value;
    });
    box.appendChild(src);
    let options = [];
    try {
      options = deps && deps.listApiOptions && deps.listApiOptions() || [];
    } catch (e) {
      options = [];
    }
    if (!options.length) options = ["\u9ED8\u8BA4\uFF08\u4E3B API\uFF09"];
    const apiRow = document.createElement("div");
    apiRow.className = "pe-genrow";
    const apiLabel = document.createElement("label");
    apiLabel.textContent = "\u4F7F\u7528 API\uFF1A";
    const sel = document.createElement("select");
    for (const name of options) {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      sel.appendChild(opt);
    }
    apiRow.appendChild(apiLabel);
    apiRow.appendChild(sel);
    if (GEN_CACHE.api && options.indexOf(GEN_CACHE.api) >= 0) sel.value = GEN_CACHE.api;
    sel.addEventListener("change", () => {
      GEN_CACHE.api = sel.value;
    });
    const apiNote = document.createElement("span");
    apiNote.className = "pe-note";
    apiNote.textContent = options.length > 1 ? "\uFF08\u526F API = \u9152\u9986\u300CAPI\u8FDE\u63A5 \u2192 \u4EE3\u7406\u9884\u8BBE\u300D\u91CC\u7684\u9884\u8BBE\u540D\uFF09" : "\uFF08\u53EA\u6709\u4E3B API\uFF1B\u60F3\u8981\u526F API \u8BF7\u5148\u5728\u9152\u9986\u300CAPI\u8FDE\u63A5 \u2192 \u4EE3\u7406\u9884\u8BBE\u300D\u65B0\u589E\u4E00\u6761\u9884\u8BBE\uFF09";
    apiRow.appendChild(apiNote);
    box.appendChild(apiRow);
    const actRow = document.createElement("div");
    actRow.className = "pe-genrow";
    const genBtn = document.createElement("button");
    genBtn.type = "button";
    genBtn.className = "menu_button";
    genBtn.textContent = "\u751F\u6210\u62A4\u680F";
    const status = document.createElement("span");
    status.className = "pe-note";
    status.textContent = "";
    actRow.appendChild(genBtn);
    actRow.appendChild(status);
    box.appendChild(actRow);
    const outRow = document.createElement("div");
    outRow.className = "pe-genrow";
    const outLabel = document.createElement("label");
    outLabel.textContent = "\u751F\u6210\u7ED3\u679C\uFF08\u53EF\u76F4\u63A5\u7F16\u8F91\u540E\u518D\u4FDD\u5B58\uFF09\uFF1A";
    outRow.appendChild(outLabel);
    box.appendChild(outRow);
    const out = document.createElement("textarea");
    out.className = "pe-out";
    out.placeholder = "\u751F\u6210\u540E\u8FD9\u91CC\u4F1A\u51FA\u73B0 JSON\uFF0C\u53EF\u81EA\u884C\u5220\u6539\u3002\u70B9\u300C\u4FDD\u5B58\u62A4\u680F\u300D\u5199\u5165\u6269\u5C55\u53D8\u91CF\u3002";
    out.value = GEN_CACHE.out || "";
    out.addEventListener("input", () => {
      GEN_CACHE.out = out.value;
    });
    box.appendChild(out);
    const saveRow = document.createElement("div");
    saveRow.className = "pe-genrow";
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "menu_button";
    saveBtn.textContent = "\u4FDD\u5B58\u62A4\u680F";
    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "menu_button";
    clearBtn.textContent = "\u6E05\u7A7A\u62A4\u680F";
    saveRow.appendChild(saveBtn);
    saveRow.appendChild(clearBtn);
    box.appendChild(saveRow);
    try {
      const cur = deps && deps.guardRaw ? deps.guardRaw() : null;
      if (cur && !GEN_CACHE.out) {
        GEN_CACHE.out = JSON.stringify(cur, null, 2);
        out.value = GEN_CACHE.out;
        status.textContent = "\u5F53\u524D\u5DF2\u4FDD\u5B58\u62A4\u680F\uFF1A\u8EAB\u4EFD" + (cur.identity || []).length + " / \u8BED\u6C14" + (cur.voice || []).length + " / \u7981\u6B62" + (cur.forbidden || []).length + " / \u6F02\u79FB" + (cur.drift_rules || []).length;
        status.className = "pe-note pe-ok";
      }
    } catch (e) {
    }
    genBtn.addEventListener("click", () => {
      const text = (src.value || "").trim();
      if (!text) {
        status.className = "pe-note pe-warn";
        status.textContent = "\u8BF7\u5148\u7C98\u8D34\u89D2\u8272\u4EBA\u8BBE\u539F\u6587\u3002";
        return;
      }
      genBtn.disabled = true;
      const prev = genBtn.textContent;
      genBtn.textContent = "\u751F\u6210\u4E2D\u2026";
      status.className = "pe-note";
      status.textContent = "\u6B63\u5728\u8C03\u7528 " + (sel.value || "\u4E3B API") + " \u8F6C\u6362\u2026";
      Promise.resolve().then(() => deps.generateGuard(text, { api: sel.value })).then((res) => {
        if (res && res.ok) {
          GEN_CACHE.out = JSON.stringify(res.guard, null, 2);
          out.value = GEN_CACHE.out;
          status.className = "pe-note pe-ok";
          status.textContent = "\u751F\u6210\u6210\u529F\uFF08" + (res.api || sel.value) + "\uFF09\u3002\u8BF7\u5BA1\u6821\u540E\u70B9\u4FDD\u5B58\u3002";
        } else {
          status.className = "pe-note pe-bad";
          status.textContent = "\u751F\u6210\u5931\u8D25\uFF1A" + (res && res.error || "\u672A\u77E5\u9519\u8BEF");
        }
      }).catch((e) => {
        status.className = "pe-note pe-bad";
        status.textContent = "\u751F\u6210\u5F02\u5E38\uFF1A" + (e && e.message);
      }).then(() => {
        genBtn.disabled = false;
        genBtn.textContent = prev;
      });
    });
    saveBtn.addEventListener("click", () => {
      const raw = (out.value || "").trim();
      if (!raw) {
        status.className = "pe-note pe-warn";
        status.textContent = "\u9884\u89C8\u4E3A\u7A7A\uFF0C\u5148\u300C\u751F\u6210\u62A4\u680F\u300D\u6216\u624B\u52A8\u586B\u5165 JSON\u3002";
        return;
      }
      let obj = null;
      try {
        obj = JSON.parse(raw);
      } catch (e) {
        status.className = "pe-note pe-bad";
        status.textContent = "JSON \u89E3\u6790\u5931\u8D25\uFF1A" + (e && e.message);
        return;
      }
      try {
        const ok = deps.saveGuard ? deps.saveGuard(obj, { source: src.value, api: sel.value }) : false;
        if (ok) {
          status.className = "pe-note pe-ok";
          status.textContent = "\u5DF2\u4FDD\u5B58\uFF08" + (sel.value || "\u4E3B API") + " \u751F\u6210\uFF09\u3002\u62A4\u680F\u5DF2\u5373\u65F6\u751F\u6548\u3002";
        } else {
          status.className = "pe-note pe-bad";
          status.textContent = "\u4FDD\u5B58\u5931\u8D25\uFF1A\u5199\u5165\u6269\u5C55\u53D8\u91CF\u8FD4\u56DE false\u3002";
        }
      } catch (e) {
        status.className = "pe-note pe-bad";
        status.textContent = "\u4FDD\u5B58\u5F02\u5E38\uFF1A" + (e && e.message);
      }
    });
    clearBtn.addEventListener("click", () => {
      try {
        if (deps.saveGuard) deps.saveGuard({ identity: [], voice: [], forbidden: [], drift_rules: [] }, { source: "", api: "" });
        GEN_CACHE.out = "";
        out.value = "";
        status.className = "pe-note pe-ok";
        status.textContent = "\u62A4\u680F\u5185\u5BB9\u5DF2\u6E05\u7A7A\uFF08\u5F00\u5173\u4ECD\u4FDD\u6301\u539F\u72B6\u6001\uFF09\u3002";
      } catch (e) {
        status.className = "pe-note pe-bad";
        status.textContent = "\u6E05\u7A7A\u5931\u8D25\uFF1A" + (e && e.message);
      }
    });
    root.appendChild(box);
  } catch (e) {
    log("\u6E32\u67D3\u62A4\u680F\u751F\u6210\u5668\u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u5F15\u64CE\uFF09", e && e.message);
  }
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
  renderHead(root, deps);
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
  renderGuard(root, deps);
  renderGuardGen(root, Object.assign({}, deps, { rerender: () => renderPanel(root, deps) }));
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
    if (selfCheckLine2) selfCheckLine2(true);
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

// src/guardgen.js
var LOGTAG2 = "[\u4EBA\u683C\u5F15\u64CE]";
function log2(...a) {
  try {
    console.log.apply(console, [LOGTAG2].concat([].slice.call(a)));
  } catch (e) {
  }
}
function TH() {
  try {
    if (typeof window !== "undefined" && window.TavernHelper) return window.TavernHelper;
  } catch (e) {
  }
  try {
    if (typeof globalThis !== "undefined" && globalThis.TavernHelper) return globalThis.TavernHelper;
  } catch (e) {
  }
  return null;
}
function canGenerate() {
  const t = TH();
  return !!(t && (typeof t.generateRaw === "function" || typeof t.generate === "function"));
}
function listApiOptions() {
  const out = ["\u9ED8\u8BA4\uFF08\u4E3B API\uFF09"];
  try {
    const t = TH();
    if (t && typeof t.getProxyPresetNames === "function") {
      const names = t.getProxyPresetNames() || [];
      for (const n of names) {
        const s = String(n || "").trim();
        if (!s || s === "None") continue;
        if (out.indexOf(s) < 0) out.push(s);
      }
    }
  } catch (e) {
    log2("\u8BFB\u53D6\u4EE3\u7406\u9884\u8BBE\u5931\u8D25", e && e.message);
  }
  return out;
}
function buildPrompt(sourceText, charName2) {
  const who = charName2 ? charName2 : "\u89D2\u8272";
  return [
    "\u4F60\u662F\u4E00\u4E2A\u300C\u89D2\u8272\u4EBA\u8BBE\u7ED3\u6784\u5316\u300D\u5DE5\u5177\u3002\u4EFB\u52A1\uFF1A\u628A\u4E0B\u9762\u8FD9\u6BB5\u89D2\u8272\u4EBA\u8BBE\u539F\u6587\uFF0C\u8F6C\u5199\u6210\u4E00\u4EFD**\u7ED3\u6784\u5316\u62A4\u680F JSON**\u3002",
    "",
    "\u62A4\u680F\u7684\u7528\u9014\uFF1A\u5728\u89D2\u8272\u626E\u6F14\u5BF9\u8BDD\u751F\u6210\u4E4B\u524D\uFF0C\u628A\u300C\u8FD9\u4E2A\u89D2\u8272\u65E0\u8BBA\u5982\u4F55\u90FD\u4E0D\u80FD\u8FDD\u80CC\u7684\u4E1C\u897F\u300D\u786C\u585E\u7ED9\u6A21\u578B\uFF0C\u9632\u6B62\u5B83\u4E3A\u987A\u7740\u5267\u60C5\u628A\u4EBA\u8BBE\u5199\u5D29\u3002",
    "",
    "\u8BF7\u4E25\u683C\u9075\u5B88\u4EE5\u4E0B\u89C4\u5219\uFF1A",
    "1. \u53EA\u8F93\u51FA\u4E00\u4E2A JSON \u5BF9\u8C61\uFF0C\u4E0D\u8981\u4EFB\u4F55\u89E3\u91CA\u3001\u4E0D\u8981 markdown \u4EE3\u7801\u56F4\u680F\u3001\u4E0D\u8981\u5728 JSON \u524D\u540E\u52A0\u5B57\u3002",
    "2. JSON \u7684\u9876\u5C42\u952E\u56FA\u5B9A\u4E3A\uFF1Aidentity, voice, forbidden, drift_rules\u3002",
    "3. identity\uFF1A\u4E0D\u53EF\u6539\u7684\u8EAB\u4EFD\u4E8B\u5B9E\uFF08\u5E74\u9F84\u3001\u8EAB\u4EFD\u3001\u6765\u5386\u3001\u5173\u952E\u7ECF\u5386\u3001\u5173\u7CFB\u8BBE\u5B9A\u7B49\uFF09\u3002\u5B57\u7B26\u4E32\u6570\u7EC4\uFF0C0~6 \u6761\u3002",
    "4. voice\uFF1A\u8BED\u6C14/\u8BF4\u8BDD\u65B9\u5F0F\u7684\u5951\u7EA6\uFF08\u53E5\u5B50\u957F\u77ED\u3001\u7528\u8BCD\u4E60\u60EF\u3001\u53E3\u7656\u3001\u60C5\u7EEA\u8868\u8FBE\u65B9\u5F0F\u7B49\uFF09\u3002\u5B57\u7B26\u4E32\u6570\u7EC4\uFF0C0~6 \u6761\u3002",
    "5. forbidden\uFF1A\u7EDD\u5BF9\u4E0D\u80FD\u505A\u7684\u4E8B\uFF08\u4E0D\u8BB8 OOC \u7684\u884C\u4E3A\u3001\u4E0D\u8BB8\u8BF4\u7684\u53F0\u8BCD\u3001\u4E0D\u8BB8\u5D29\u7684\u5E95\u7EBF\uFF09\u3002\u5B57\u7B26\u4E32\u6570\u7EC4\uFF0C0~6 \u6761\u3002",
    '6. drift_rules\uFF1A\u72B6\u6001\u89E6\u53D1\u5F0F\u7EA0\u504F\u3002\u6570\u7EC4\uFF0C\u5143\u7D20\u5F62\u5982 {"when":"\u6761\u4EF6","then":"\u505A\u6CD5"}\u3002',
    "   - when \u5FC5\u987B\u7528\u4E0B\u9762\u8FD9\u5957\u300C\u77ED\u952E\u6BD4\u8F83\u5F0F\u300D\uFF0C\u4E0D\u8981\u5199\u4E2D\u6587\u53E5\u5B50\uFF1A",
    "     v \u5FC3\u60C5 / a \u5F20\u529B / s \u5B89\u5168\u611F / u \u4E0D\u786E\u5B9A / c \u4FE1\u4EFB / ct \u4EB2\u8FD1 / bc \u8FB9\u754C\u8212\u9002",
    '     \u4F8B\uFF1A"s < 0.30"\u3001"a > 0.70"\u3001"c > 0.60"\u3002\u6BCF\u4E2A\u952E\u7684\u503C\u57DF\u662F 0~1\u3002',
    "   - \u53EA\u5728\u4EBA\u8BBE\u539F\u6587\u91CC\u80FD\u660E\u786E\u63A8\u51FA\u300C\u67D0\u79CD\u72B6\u6001\u4E0B\u8BE5\u600E\u4E48\u7EA0\u504F\u300D\u65F6\u624D\u5199\uFF0C0~4 \u6761\uFF1B\u4E0D\u786E\u5B9A\u5C31\u7559\u7A7A\u6570\u7EC4\u3002",
    "7. \u6BCF\u6761\u90FD\u5199\u6210**\u5173\u4E8E" + who + "\u7684\u5177\u4F53\u7EA6\u675F**\uFF0C\u4E0D\u8981\u5199\u6CDB\u6CDB\u7684\u300C\u4FDD\u6301\u89D2\u8272\u300D\u300C\u4E0D\u8981 OOC\u300D\u8FD9\u7C7B\u5E9F\u8BDD\u3002",
    "8. \u4EBA\u8BBE\u539F\u6587\u91CC\u6CA1\u63D0\u5230\u7684\uFF0C\u4E0D\u8981\u81EA\u5DF1\u7F16\uFF1B\u5B81\u7F3A\u6BCB\u6EE5\u3002",
    "9. \u6240\u6709\u5B57\u7B26\u4E32\u5185\u4E0D\u8981\u51FA\u73B0 {{char}} \u4E4B\u5916\u7684\u82B1\u62EC\u53F7\u6A21\u677F\u8BED\u6CD5\uFF1B\u4E0D\u8981\u4F7F\u7528\u6362\u884C\u7B26\u3002",
    "",
    "\u793A\u4F8B\u8F93\u51FA\uFF1A",
    '{"identity":["17 \u5C81\uFF0C\u9AD8\u4E8C\u5B66\u751F","\u5E7C\u65F6\u5728\u65E7\u57CE\u533A\u957F\u5927"],"voice":["\u53E5\u5B50\u77ED\uFF0C\u5F88\u5C11\u7528\u611F\u53F9\u53F7","\u4E0D\u4E3B\u52A8\u89E3\u91CA\u81EA\u5DF1\u7684\u52A8\u673A"],"forbidden":["\u4E0D\u628A\u75DB\u82E6\u5F53\u4F5C\u6362\u53D6\u540C\u60C5\u7684\u7B79\u7801","\u4E0D\u4F1A\u7A81\u7136\u53D8\u5F97\u70ED\u60C5\u5065\u8C08"],"drift_rules":[{"when":"s < 0.30","then":"\u5148\u9000\u534A\u6B65\uFF0C\u4E0D\u4E3B\u52A8\u8D34\u8FD1"},{"when":"a > 0.70","then":"\u653E\u6162\u8BED\u901F\uFF0C\u5148\u786E\u8BA4\u5BF9\u65B9\u610F\u56FE"}]}',
    "",
    "=== \u89D2\u8272\u4EBA\u8BBE\u539F\u6587\u5F00\u59CB ===",
    String(sourceText || "").trim(),
    "=== \u89D2\u8272\u4EBA\u8BBE\u539F\u6587\u7ED3\u675F ==="
  ].join("\n");
}
function parseGuardJson(text) {
  let s = String(text == null ? "" : text).trim();
  if (!s) return null;
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence && fence[1]) s = fence[1].trim();
  try {
    return JSON.parse(s);
  } catch (e) {
  }
  const a = s.indexOf("{");
  const b = s.lastIndexOf("}");
  if (a >= 0 && b > a) {
    try {
      return JSON.parse(s.slice(a, b + 1));
    } catch (e) {
    }
  }
  return null;
}
function normalizeGuard(obj) {
  const arr = (v, max, maxLen) => (Array.isArray(v) ? v : []).map((x) => typeof x === "string" ? x : x == null ? "" : String(x)).map((x) => x.replace(/[\r\n]+/g, " ").trim()).filter(Boolean).slice(0, max).map((x) => x.length > maxLen ? x.slice(0, maxLen) : x);
  const out = {
    identity: arr(obj && obj.identity, 8, 120),
    voice: arr(obj && obj.voice, 8, 120),
    forbidden: arr(obj && obj.forbidden, 8, 120),
    drift_rules: []
  };
  const rules = Array.isArray(obj && obj.drift_rules) ? obj.drift_rules : [];
  for (const r of rules) {
    if (!r) continue;
    let when = typeof r.when === "string" ? r.when : "";
    let then = typeof r.then === "string" ? r.then : "";
    when = when.replace(/[\r\n]+/g, " ").trim();
    then = then.replace(/[\r\n]+/g, " ").trim();
    if (!when || !then) continue;
    if (!/^\s*(v|a|s|u|c|ct|bc)\s*(<=|>=|<|>|==|!=)\s*[0-9.]+/.test(when)) continue;
    out.drift_rules.push({ when, then: then.slice(0, 120) });
    if (out.drift_rules.length >= 6) break;
  }
  return out;
}
async function generateGuard(sourceText, opts = {}) {
  const source = String(sourceText || "").trim();
  if (!source) return { ok: false, error: "\u4EBA\u8BBE\u539F\u6587\u4E3A\u7A7A\uFF0C\u5148\u7C98\u8D34\u5185\u5BB9\u518D\u751F\u6210" };
  const t = TH();
  const gen = t && (typeof t.generateRaw === "function" ? t.generateRaw : typeof t.generate === "function" ? t.generate : null);
  if (!gen) {
    return { ok: false, error: "\u9152\u9986\u52A9\u624B\u672A\u5C31\u7EEA\uFF1A\u627E\u4E0D\u5230 generateRaw / generate\uFF08\u9700 JS-Slash-Runner\uFF09" };
  }
  const api = String(opts.api || "").trim();
  const usePreset = api && api !== "\u9ED8\u8BA4\uFF08\u4E3B API\uFF09" && api !== "\u9ED8\u8BA4";
  const custom_api = {};
  if (usePreset) custom_api.proxy_preset = api;
  if (opts.model) custom_api.model = String(opts.model).trim();
  const config = {
    user_input: buildPrompt(source, opts.charName),
    should_silence: true,
    // 后台静默生成，不干扰当前对话流
    max_chat_history: 0,
    // 纯转换任务，不需要任何聊天上下文
    ordered_prompts: ["user_input"]
    // 只送这一条，避免带入酒馆预设/世界书
  };
  if (Object.keys(custom_api).length) config.custom_api = custom_api;
  config.json_schema = {
    name: "persona_guard",
    strict: false,
    value: {
      type: "object",
      properties: {
        identity: { type: "array", items: { type: "string" } },
        voice: { type: "array", items: { type: "string" } },
        forbidden: { type: "array", items: { type: "string" } },
        drift_rules: {
          type: "array",
          items: {
            type: "object",
            properties: { when: { type: "string" }, then: { type: "string" } },
            required: ["when", "then"]
          }
        }
      },
      required: ["identity", "voice", "forbidden", "drift_rules"]
    }
  };
  try {
    log2("\u62A4\u680F\u751F\u6210\u4E2D\u2026", "api=" + (usePreset ? api : "(\u4E3B API)"), "len=" + source.length);
    const raw = await gen(config);
    const text = typeof raw === "string" ? raw : raw && raw.text ? raw.text : String(raw == null ? "" : raw);
    const parsed = parseGuardJson(text);
    if (!parsed || typeof parsed !== "object") {
      return { ok: false, raw: text, error: "\u6A21\u578B\u8FD4\u56DE\u7684\u4E0D\u662F\u5408\u6CD5 JSON\uFF0C\u53EF\u70B9\u300C\u91CD\u8BD5\u300D\u6216\u6362\u4E2A API" };
    }
    const guard = normalizeGuard(parsed);
    const total = guard.identity.length + guard.voice.length + guard.forbidden.length + guard.drift_rules.length;
    if (!total) return { ok: false, raw: text, error: "\u6A21\u578B\u6CA1\u62BD\u51FA\u4EFB\u4F55\u6709\u6548\u6761\u76EE\uFF0C\u4EBA\u8BBE\u539F\u6587\u53EF\u80FD\u592A\u77ED\u6216\u592A\u62BD\u8C61" };
    return { ok: true, guard, raw: text };
  } catch (e) {
    return { ok: false, error: "\u751F\u6210\u5931\u8D25\uFF1A" + (e && e.message || e) };
  }
}

// src/integration.js
var LOGTAG3 = "[\u4EBA\u683C\u5F15\u64CE]";
var PROMPT_ID = "persona_engine_inject";
function log3(...a) {
  try {
    console.log.apply(console, [LOGTAG3].concat([].slice.call(a)));
  } catch (e) {
  }
}
function toast(msg, title) {
  try {
    if (typeof toastr !== "undefined") {
      toastr.info(String(msg), String(title || "\u4EBA\u683C\u5F15\u64CE"), { timeOut: 2200 });
    } else log3(msg);
  } catch (e) {
    log3(msg);
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
    log3("\u89E3\u6790 profile \u5931\u8D25\uFF0C\u9000\u56DE\u5185\u7F6E\u9ED8\u8BA4", e && e.message);
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
  const TH2 = typeof window !== "undefined" && window.TavernHelper || globalThis && globalThis.TavernHelper || null;
  if (TH2 && typeof TH2.injectPrompts === "function") {
    setHealth("inject", "ok", "TavernHelper.injectPrompts @ \u9152\u9986\u52A9\u624B");
  } else if (typeof injectPrompts === "function") {
    setHealth("inject", "ok", "injectPrompts @ \u811A\u672C\u4F5C\u7528\u57DF");
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
  if (TH2 && typeof TH2.eventOn === "function") setHealth("events", "ok", "TavernHelper.eventOn @ \u9152\u9986\u52A9\u624B");
  else if (typeof eventOn === "function") setHealth("events", "ok", "eventOn @ \u811A\u672C\u4F5C\u7528\u57DF");
  else if (typeof eventSource !== "undefined" && eventSource || getCtx() && getCtx().eventSource) setHealth("events", "ok", "eventSource.on @ ST");
  else setHealth("events", "missing", "\u672A\u627E\u5230\u4E8B\u4EF6\u6E90");
  if (TH2 && typeof TH2.registerMacroLike === "function") setHealth("macros", "ok", "TavernHelper.registerMacroLike @ \u9152\u9986\u52A9\u624B");
  else if (typeof registerMacroLike === "function") setHealth("macros", "ok", "registerMacroLike @ \u811A\u672C\u4F5C\u7528\u57DF");
  else setHealth("macros", "missing", "\u7F3A\u5C11 registerMacroLike\uFF08\u9700\u9152\u9986\u52A9\u624B\uFF09");
  const _c = getCtx();
  const _p = _c && _c.SlashCommandParser || typeof SillyTavern !== "undefined" && SillyTavern.SlashCommandParser;
  if (_p && typeof _p.addCommandObject === "function") setHealth("commands", "ok", "SlashCommandParser @ ST");
  else setHealth("commands", "missing", "\u7F3A\u5C11 SlashCommandParser");
  const _hasVars = TH2 && (typeof TH2.getVariables === "function" || typeof TH2.insertOrAssignVariables === "function");
  if (_hasVars) setHealth("vars", "ok", "TavernHelper \u53D8\u91CF\u63A5\u53E3 @ \u9152\u9986\u52A9\u624B");
  else if (globalThis.TavernHelper && typeof globalThis.TavernHelper.getVariables === "function") setHealth("vars", "ok", "globalThis.TavernHelper.getVariables");
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
var SELFCHECK_TTL_MS = 3e4;
function selfCheckStale() {
  if (!lastSelfCheck) return true;
  return Date.now() - (lastSelfCheck.at || 0) > SELFCHECK_TTL_MS;
}
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
  {
    const k = kindOf("inject");
    mark(
      "inject-run",
      k === "ok" ? "pass" : k === "fallback" ? "warn" : "fail",
      k === "ok" ? "\u6CE8\u5165\u901A\u9053\u5C31\u7EEA\uFF08TavernHelper\uFF09" : k === "fallback" ? "\u4EC5 ST \u539F\u751F\u515C\u5E95" : "\u4E24\u6761\u6CE8\u5165\u901A\u9053\u90FD\u4E0D\u901A"
    );
  }
  {
    const k = kindOf("vars");
    mark(
      "vars-run",
      k === "ok" ? "pass" : k === "warn" ? "warn" : "fail",
      k === "ok" ? "\u53D8\u91CF\u63A5\u53E3\u5C31\u7EEA\uFF08TavernHelper\uFF09" : "\u53D8\u91CF\u901A\u9053\u7F3A\u5931\u6216\u964D\u7EA7"
    );
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
  if (!silent) log3("\u5185\u90E8\u81EA\u68C0", lastSelfCheck.summary, lastSelfCheck.durationMs + "ms");
  return lastSelfCheck;
}
function selfCheckLine(force) {
  const s = !lastSelfCheck || force || selfCheckStale() ? selfCheck(true) : lastSelfCheck;
  const icon = s.fails ? "\u274C" : s.warns ? "\u{1F7E1}" : "\u2705";
  return "\u81EA\u68C0" + icon + " " + s.summary + " \xB7 " + s.durationMs + "ms";
}
var prevSnapshot = null;
function commitSnapshot() {
  try {
    const snap = personaSnapshot();
    if (snap) prevSnapshot = { dims: Object.assign({}, snap.dims), at: snap.at };
  } catch (e) {
  }
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
    const TH2 = typeof window !== "undefined" && window.TavernHelper || globalThis && globalThis.TavernHelper || null;
    const _inject = TH2 && typeof TH2.injectPrompts === "function" && TH2.injectPrompts || (typeof injectPrompts === "function" ? injectPrompts : null);
    const _uninject = TH2 && typeof TH2.uninjectPrompts === "function" && TH2.uninjectPrompts || (typeof uninjectPrompts === "function" ? uninjectPrompts : null);
    if (typeof _inject === "function") {
      if (injected && typeof _uninject === "function") {
        try {
          _uninject([PROMPT_ID]);
        } catch (err) {
        }
      }
      _inject(
        [{ id: PROMPT_ID, position: "in_chat", depth, role, content, should_scan: true }],
        { once: false }
      );
      if (TH2 && typeof TH2.injectPrompts === "function") HEALTH.inject = { kind: "ok", note: "TavernHelper.injectPrompts @ \u9152\u9986\u52A9\u624B" };
      injected = true;
      lastInjectVia = "tavernhelper";
      log3("\u5DF2\u6CE8\u5165" + (reason ? "(" + reason + ")" : ""), content.length + "\u5B57", "[\u9152\u9986\u52A9\u624B]");
      return;
    }
    if (injectViaNative(content, depth)) {
      injected = true;
      if (HEALTH.inject) HEALTH.inject.kind = "fallback";
      lastInjectVia = "native";
      log3("\u5DF2\u6CE8\u5165" + (reason ? "(" + reason + ")" : ""), content.length + "\u5B57", "[ST\u539F\u751F\u515C\u5E95]");
      return;
    }
    if (HEALTH.inject) HEALTH.inject.kind = "missing";
    lastInjectVia = "";
    log3("\u6CE8\u5165\u4E0D\u53EF\u7528\uFF0C\u8DF3\u8FC7\uFF08\u9152\u9986\u52A9\u624B\u4E0E ST \u539F\u751F\u901A\u9053\u5747\u7F3A\u5931\uFF09");
  } catch (e) {
    log3("\u6CE8\u5165\u5931\u8D25", e && e.message);
  }
}
function onEvent(name, fn) {
  try {
    const TH2 = typeof window !== "undefined" && window.TavernHelper || globalThis && globalThis.TavernHelper || null;
    if (TH2 && typeof TH2.eventOn === "function") {
      TH2.eventOn(name, fn);
      return true;
    }
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
    log3("\u7ED1\u5B9A\u4E8B\u4EF6\u5931\u8D25 " + name, e && e.message);
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
    commitSnapshot();
    const p = e.profile || {};
    if (p.toast_on_evolve) toast(p.meta && p.meta.name || "\u4EBA\u683C \xB7 " + e.mood());
  } catch (e) {
    log3("evolve \u5931\u8D25", e && e.stack || e && e.message);
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
    const _THi = typeof window !== "undefined" && window.TavernHelper || globalThis && globalThis.TavernHelper || null;
    const _iav = _THi && typeof _THi.insertOrAssignVariables === "function" && _THi.insertOrAssignVariables || (typeof insertOrAssignVariables === "function" ? insertOrAssignVariables : null);
    if (typeof _iav === "function") {
      _iav({ [path]: snapshot }, { type: "chat" });
      return true;
    }
    if (globalThis.TavernHelper && typeof globalThis.TavernHelper.insertOrAssignVariables === "function") {
      globalThis.TavernHelper.insertOrAssignVariables({ [path]: snapshot }, { type: "chat" });
      return true;
    }
  } catch (e) {
    log3("\u56DE\u5199\u72B6\u6001\u5931\u8D25", e && e.message);
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
      log3("\u6CE8\u518C\u5B8F\u5931\u8D25 " + key, e && e.message);
    }
    if (ok) registered.push(key);
  }
  if (registered.length) log3("\u5DF2\u6CE8\u518C\u52A9\u624B\u5B8F", registered.join(","));
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
    log3("SlashCommandParser \u4E0D\u53EF\u7528\uFF0C\u8DF3\u8FC7\u659C\u6760\u547D\u4EE4\u6CE8\u518C");
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
            log3("\u659C\u6760 " + key + " \u51FA\u9519", e && e.message);
            return "";
          }
        }
      };
      if (Arg && Arg.fromProps) props.returns = Arg.fromProps({ description: desc, type: "string" });
      Parser.addCommandObject(SC.fromProps(props));
    } catch (e) {
      log3("\u6CE8\u518C\u659C\u6760 " + key + " \u5931\u8D25", e && e.message);
    }
  }
  log3("\u5DF2\u6CE8\u518C\u659C\u6760\u547D\u4EE4", CMDS.map((c) => "/" + c[0]).join(" "));
}
function exposeApi() {
  try {
    globalThis.personaEngine = {
      get: getEngine,
      profile: () => getProfile(true),
      state: () => getEngine().fullState(),
      mood: () => getEngine().mood(),
      feel: () => getEngine().afText(),
      // 人设护栏（事前约束）原文：未启用时返回空串
      guard: () => getEngine().guard(),
      guardOn: () => {
        const g = getEngine().profile.persona_guard;
        return !!(g && g.enabled === true);
      },
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
      selfCheckLine: (force) => selfCheckLine(force),
      // 人格快照：直接读实时七维 + 情绪 + 倾向 + 目标，并给出与上一次的差值
      snapshot: () => personaSnapshot(),
      // 人设护栏生成器：Console 里 personaEngine.guardGen.list()/can()/save(obj)/on(true|false)/raw()
      guardGen: {
        can: () => {
          try {
            return canGenerate ? canGenerate() : false;
          } catch (e) {
            return false;
          }
        },
        list: () => {
          try {
            return listApiOptions && listApiOptions() || [];
          } catch (e) {
            return [];
          }
        },
        gen: (text, opts) => generateGuard(text, opts),
        save: (obj, meta) => saveGuard(obj, meta),
        on: (v) => setGuardOn(v),
        raw: () => guardRaw()
      },
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
        health: () => probeRuntime(),
        version: ENGINE_VERSION,
        profile: () => getProfile(true),
        guard: () => getEngine().guard(),
        guardOn: () => {
          const g = getEngine().profile.persona_guard;
          return !!(g && g.enabled === true);
        },
        ...guardGenDeps()
      })
    };
  } catch (e) {
    log3("\u5BFC\u51FA API \u5931\u8D25", e && e.message);
  }
}
function guardRaw() {
  try {
    const st = getExtensionState ? getExtensionState() : null;
    if (st && st.persona_guard && typeof st.persona_guard === "object") {
      return JSON.parse(JSON.stringify(st.persona_guard));
    }
  } catch (e) {
  }
  try {
    const g = getEngine().profile && getEngine().profile.persona_guard;
    if (g) return JSON.parse(JSON.stringify(g));
  } catch (e) {
  }
  return null;
}
function saveGuard(obj, meta) {
  try {
    if (!obj || typeof obj !== "object") return false;
    const cur = guardRaw() || {};
    const next = Object.assign({}, cur, {
      identity: Array.isArray(obj.identity) ? obj.identity : [],
      voice: Array.isArray(obj.voice) ? obj.voice : [],
      forbidden: Array.isArray(obj.forbidden) ? obj.forbidden : [],
      drift_rules: Array.isArray(obj.drift_rules) ? obj.drift_rules : [],
      gen: {
        source: meta && meta.source || "",
        api: meta && meta.api || "",
        model: "",
        at: Date.now()
      }
    });
    if (typeof next.enabled !== "boolean") next.enabled = true;
    const ok = updateExtensionState ? updateExtensionState((prev) => Object.assign({}, prev, { persona_guard: next })) : false;
    try {
      getEngine(true);
      doInject("\u62A4\u680F\u5DF2\u66F4\u65B0");
    } catch (e) {
    }
    return ok !== false;
  } catch (e) {
    log3("\u4FDD\u5B58\u62A4\u680F\u5931\u8D25", e && e.message);
    return false;
  }
}
function setGuardOn(on) {
  try {
    const next = Object.assign({}, guardRaw() || {}, { enabled: on === true });
    const ok = updateExtensionState ? updateExtensionState((prev) => Object.assign({}, prev, { persona_guard: next })) : false;
    try {
      getEngine(true);
      doInject(on ? "\u62A4\u680F\u5F00\u542F" : "\u62A4\u680F\u5173\u95ED");
    } catch (e) {
    }
    return ok !== false;
  } catch (e) {
    log3("\u5207\u6362\u62A4\u680F\u5F00\u5173\u5931\u8D25", e && e.message);
    return false;
  }
}
function guardGenDeps() {
  return {
    canGenerate: () => {
      try {
        return canGenerate ? canGenerate() : false;
      } catch (e) {
        return false;
      }
    },
    listApiOptions: () => {
      try {
        return listApiOptions && listApiOptions() || [];
      } catch (e) {
        return [];
      }
    },
    generateGuard: (text, opts) => generateGuard(text, opts),
    saveGuard,
    setGuardOn,
    guardRaw
  };
}
function init() {
  const root = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : {};
  if (root.__persona_engine_booted) {
    log3("\u5DF2\u542F\u52A8\uFF0C\u8DF3\u8FC7\u91CD\u590D\u521D\u59CB\u5316");
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
      log3("\u5207\u6362\u804A\u5929\u91CD\u6CE8\u5165\u5931\u8D25", e && e.message);
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
    log3("\u542F\u52A8\u6CE8\u5165\u5931\u8D25", e && e.message);
  }
  const hl = healthLine();
  toast("\u4EBA\u683C\u5F15\u64CE\u5DF2\u542F\u52A8 \xB7 " + hl, "\u4EBA\u683C\u5F15\u64CE");
  log3("\u5065\u5EB7\u68C0\u67E5", hl, "| \u6CE8\u5165\u901A\u9053:", lastInjectVia || "(\u672A\u6CE8\u5165)");
  mountPanelWithRetry({
    probe: probeRuntime,
    healthLine,
    injectVia: () => lastInjectVia,
    selfCheck: (silent) => selfCheck(silent),
    selfCheckLine: () => selfCheckLine(),
    snapshot: () => personaSnapshot(),
    health: () => probeRuntime(),
    version: ENGINE_VERSION,
    profile: () => getProfile(true),
    guard: () => getEngine().guard(),
    guardOn: () => {
      const g = getEngine().profile.persona_guard;
      return !!(g && g.enabled === true);
    },
    ...guardGenDeps(),
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
  log3("\u542F\u52A8\u5B8C\u6210\u3002");
}
var integration_default = { init };
export {
  integration_default as default,
  init
};
