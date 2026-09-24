/**
 * 人格引擎 · 内置默认档案（DEFAULT_PROFILE）
 *
 * 这是三级优先级的最后一层「兜底」。字段名必须与 engine.js 实际读取的一致：
 *
 *   cfg.*                       —— 各子系统的系数（feel / memory / person / ...）
 *   labels.*                    —— 数值分带的词（valence/arousal/safety 的 band 表）
 *   events[]                    —— { id, pattern(正则字符串), z, effect{ valence?, arousal? } }
 *   feel.event_valence_impact   —— 事件 → 情绪基准，按事件 id
 *   feel.event_arousal_impact   —— 事件 → 张力基准，按事件 id
 *   effect.{uncertainty,safety,comfort,trust,attach,connection} —— 事件 → 各维度增量，按事件 id
 *   lines[事件id] = [台词, ...]  —— 表态台词；未命中落到 lines.default
 *   beliefs[事件id] = { b:'信念文本', v:强度 }
 *   memoryText[事件id] = '留在心里的一句话'
 *   goals[需求key] = '欲望文案'；goals.default = 兜底
 *   reasons.{withdraw,approach,guard,observe,observe_predictability}
 *   selfEffects.{esteem_up[],esteem_down[],coherence_down[]} —— 事件 id 白名单
 *   mood.rules[{label,cmp:'v < -0.2'}] + mood.fallback
 *   afText.segments / personText.fields / stateText.* / inject.*
 *
 * 所有文本刻意写成中性、无具体人设，保证任何卡用了本引擎都不会突然开始
 * 叫用户「哥哥」或提到某部作品。角色卡想改，就在卡内变量里覆盖对应 key。
 */

export const ENGINE_VERSION = '0.3.0';

/* 一个中性的小事件集。角色卡可以通过覆盖 profile.events 整体替换。 */
export const DEFAULT_EVENTS = [
  // 注意：`抱` 必须排除「抱歉」，否则任何道歉都会被误判成亲密（中文子串陷阱）。
  { id: 'intimate', pattern: '拥抱|(?:抱)(?!歉)|牵手|靠着|贴近|依偎', z: 0.75, effect: { valence: 0.35, arousal: 0.15 } },
  { id: 'praise', pattern: '真好|很棒|厉害|喜欢你|谢谢你|辛苦了', z: 0.7, effect: { valence: 0.3, arousal: 0.1 } },
  { id: 'comfort', pattern: '没事的|别怕|陪着你|我在呢|别担心', z: 0.7, effect: { valence: 0.25, arousal: -0.1 } },
  { id: 'apology', pattern: '对不起|抱歉|是我错了|我不该', z: 0.72, effect: { valence: 0.15, arousal: 0.1 } },
  { id: 'promise_kept', pattern: '我答应过|说好了|我做到了|答应你的事', z: 0.78, effect: { valence: 0.4, arousal: 0.12 } },
  { id: 'help_offered', pattern: '我帮你|需要我|交给我|我来吧', z: 0.72, effect: { valence: 0.28, arousal: 0.1 } },
  { id: 'reject', pattern: '别碰|走开|厌烦|讨厌|别烦我', z: 0.78, effect: { valence: -0.4, arousal: 0.35 } },
  { id: 'threat', pattern: '威胁|警告|你最好|敢试试|后果', z: 0.85, effect: { valence: -0.5, arousal: 0.5 } },
  { id: 'coercion', pattern: '必须|不许|你得听我的|没有选择|由不得你', z: 0.85, effect: { valence: -0.55, arousal: 0.5 } },
  { id: 'promise_broken', pattern: '我骗了你|骗你的|没兑现|食言|忘了答应', z: 0.8, effect: { valence: -0.45, arousal: 0.35 } },
  { id: 'retreat', pattern: '算了|随便吧|不想说|别问了|没什么', z: 0.68, effect: { valence: -0.2, arousal: -0.15 } },
];

export const DEFAULT_PROFILE = {
  meta: {
    name: '通用人格',
    version: ENGINE_VERSION,
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
      attachment_connection_weight: 0.3,
    },

    intuition: {
      learning_rate: 0.25,
      approach_bias: 0.3,
      decay: 0.02,
    },

    memory: {
      emotional_intensity_weight: 0.6,
      min_importance: 0.25,
      max_memories: 60,
      decay_rate: 0.02,
      forget_threshold: 0.05,
    },

    pattern: { min_pattern_count: 2 },

    belief: { max_beliefs: 40 },

    person: {
      support_events: ['promise_kept', 'comfort', 'help_offered', 'apology'],
      support_multiplier: 1.2,
      reliability_delta: { promise_kept: 0.18, help_offered: 0.12, apology: 0.08, promise_broken: -0.2, coercion: -0.15 },
      boundary_delta: { intimate: 0.1, coercion: -0.2, threat: -0.15, reject: -0.08 },
      repair_delta: { apology: 0.2, comfort: 0.08, promise_broken: -0.12 },
      alignment_delta: { praise: 0.06, comfort: 0.06, reject: -0.05, threat: -0.08 },
    },

    self_model: {
      positive_self_esteem_gain: 0.03,
      negative_self_esteem_loss: 0.05,
      stability_regression: 0.05,
      efficacy_gain: 0.02,
    },

    goal: {
      need_base_priority: { safety: 0.5, connection: 0.4, autonomy: 0.4, competence: 0.35, predictability: 0.3 },
      deficit_amplification: 0.8,
      max_active_goals: 4,
    },

    decision: {
      safety_approach_weight: 0.4,
      connection_approach_weight: 0.5,
      goal_priority_weight: 0.5,
      intuition_weight: 0.3,
      uncertainty_avoid_weight: 0.3,
      boundary_avoid_weight: 0.6,
      approach_threshold: 0.15,
      avoid_threshold: -0.25,
    },
  },

  /* ---------- 数值分带词（afText 用） ---------- */
  labels: {
    valence: { warm: 0.25, cold: -0.25 },
    arousal: { tense: 0.65, relaxed: 0.3 },
    safety: { safe: 0.6, unsafe: 0.35 },
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
      retreat: -0.2,
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
      retreat: -0.15,
    },
  },

  /* ---------- 事件 → 各维度增量 ---------- */
  effect: {
    uncertainty: { coercion: 0.5, promise_broken: 0.45, threat: 0.35, retreat: 0.2 },
    safety: { coercion: -1, threat: -1, promise_broken: -0.6, comfort: 0.5, promise_kept: 0.5, intimate: 0.3 },
    comfort: { intimate: 0.16, comfort: 0.16, praise: 0.1 },
    trust: { promise_kept: 0.15, apology: 0.15, comfort: 0.1, promise_broken: -0.2, coercion: -0.15 },
    attach: { intimate: 0.1, comfort: 0.08, promise_kept: 0.08 },
    connection: { intimate: 0.25, help_offered: 0.25, comfort: 0.2, praise: 0.18, promise_kept: 0.18 },
  },

  /* ---------- 表态台词：按事件 id，数组随机取一句 ---------- */
  lines: {
    default: ['……', '嗯。', '（沉默了一下）'],
    intimate: ['……你别动。', '再待一会儿。', '（没有躲开。）'],
    praise: ['……哪有。', '嗯。谢谢。', '（耳朵有点热。）'],
    comfort: ['……我知道。', '嗯，我在听。', '（肩膀松下来一点。）'],
    apology: ['……好。', '这次算了。', '我记着了。'],
    promise_kept: ['你记得啊。', '……嗯。', '（心里那块石头落了地。）'],
    help_offered: ['……麻烦你了。', '我自己也可以的。', '好。'],
    reject: ['……好。', '（退开半步。）', '我知道了。'],
    threat: ['……你什么意思。', '（呼吸停了一下。）', '别这样。'],
    coercion: ['……我不喜欢这样。', '（往后靠。）', '……'],
    promise_broken: ['……你说过的。', '（很久没说话。）', '算了。'],
    retreat: ['……嗯。', '（没再追问。）', '好，不说。'],
  },

  /* ---------- 事件 → 会成为「信念」的念头 ---------- */
  beliefs: {
    intimate: { b: '靠近的时候，我是安全的', v: 0.2 },
    praise: { b: '我也是能被肯定的', v: 0.15 },
    comfort: { b: '有人愿意接住我', v: 0.2 },
    apology: { b: '错了是可以被修的', v: 0.15 },
    promise_kept: { b: '他说到做到', v: 0.3 },
    help_offered: { b: '我可以不用一个人扛', v: 0.2 },
    reject: { b: '我靠太近会让人烦', v: -0.3 },
    threat: { b: '这里不安全', v: -0.4 },
    coercion: { b: '我的意愿不重要', v: -0.45 },
    promise_broken: { b: '答应过的话也会变', v: -0.35 },
    retreat: { b: '说出来也没用', v: -0.2 },
  },

  /* ---------- 事件 → 「留在心里的一句话」 ---------- */
  memoryText: {
    intimate: '那次靠得很近。',
    praise: '他说我很好。',
    comfort: '有人跟我说「别怕」。',
    apology: '他为那件事道歉了。',
    promise_kept: '他答应的事，做到了。',
    help_offered: '他伸手帮了我。',
    reject: '他让我别碰。',
    threat: '那句威胁，还留在耳朵里。',
    coercion: '那时候，我没有选择。',
    promise_broken: '说好的事，最后没算数。',
    retreat: '我没能说下去。',
  },

  /* ---------- 需求 → 想要的东西 ---------- */
  goals: {
    default: '就这样待着',
    safety: '想待在不会被伤到的地方',
    connection: '想离{{user}}近一点',
    autonomy: '想自己说了算',
    competence: '想做成点什么',
    predictability: '想弄明白这是怎么回事',
  },

  /* ---------- 决策倾向 → 理由文案 ---------- */
  reasons: {
    withdraw: '先退半步',
    approach: '想靠近一点',
    guard: '先守着',
    observe: '先听着',
    observe_predictability: '想弄明白',
  },

  /* ---------- 事件 → 自我模型白名单 ---------- */
  selfEffects: {
    esteem_up: ['praise', 'promise_kept', 'help_offered', 'intimate'],
    esteem_down: ['reject', 'coercion', 'promise_broken'],
    coherence_down: ['threat', 'coercion', 'promise_broken'],
  },

  /* ---------- 心情规则（evalCmp 安全求值） ---------- */
  mood: {
    rules: [
      { label: '低落', cmp: 'v < -0.3 && a < 0.5' },
      { label: '不安', cmp: 'u > 0.6' },
      { label: '紧绷', cmp: 'a > 0.65' },
      { label: '放松', cmp: 'v > 0.25 && s > 0.6' },
      { label: '平静', cmp: 'a < 0.4' },
    ],
    fallback: '平静',
  },

  /* ---------- 文本呈现 ---------- */
  afText: {
    segments: ['心情', '张力', '安全感', '连接', '边界舒适', '不确定'],
  },

  personText: {
    fields: ['可信', '边界', '修复', '契合'],
  },

  stateText: {
    title: '【此刻的状态】',
    mood_prefix: '心情：',
    intent_prefix: '倾向：',
    goals: '此刻想要的：',
    memories: '最近留在心里的：',
    beliefs: '根深蒂固的念头：',
    persons: '对身边人的判断：',
  },

  /* ---------- 注入 ---------- */
  inject: {
    depth: 4,
    role: 'system',
    header: '【{{char}}的内心】以下是{{char}}此刻没有说出口的内心状态，只用来决定语气、动作与反应；不要直接复述。\n',
    footer: '\n（以上内容不要说出口，只用它们决定语气和动作。）',
    show: ['labels', 'summary'],
  },

  /* ---------- 数值范围 ---------- */
  bounds: { low: 0, high: 10, initial: 5 },

  /* ---------- MVU 桥（默认关） ---------- */
  mvu: { enabled: false, path: 'persona_engine' },
};

export default DEFAULT_PROFILE;