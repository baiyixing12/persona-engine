# PROFILE 覆盖契约

persona-engine 的所有行为都由一份 **profile**（纯 JSON 对象）驱动。
你不需要改引擎代码，只要提供一份 profile，就能把「通用人格」变成任何角色。

---

## 一、三级优先级（高 → 低）

| 级别 | 来源 | 用途 |
|---|---|---|
| 1 | **角色卡内变量** `persona_engine_profile`（chat 优先于 character） | 单个角色/单次对话专属设定 |
| 2 | **扩展私有变量** `.profile`（扩展设置面板） | 全局默认偏好 |
| 3 | **内置兜底** `src/defaults.js` 的 `DEFAULT_PROFILE` | 出厂中性值 |

### 合并策略：深合并（deep merge）

- **普通对象**：递归合并。你只写 `lines.praise`，其他 `lines.*`、其他一级键全部保留。
- **数组**：**整体替换**，不合并。典型是 `events`——你一旦提供，引擎完全用你的事件表。
- **基本类型**：直接覆盖。

> 所以：**你只需要写「跟默认不一样」的部分**，剩下的自动继承。

---

## 二、怎么覆盖（三种写法）

### 写法 1：角色卡变量（最常用）

在角色卡（或聊天）变量里写一个键 `persona_engine_profile`：

```json
{
  "persona_engine_profile": {
    "meta": { "name": "林晚" },
    "lines": {
      "intimate": ["……别看我。", "（把脸埋进你肩里。）"]
    },
    "initial": {
      "af": { "v": -0.1, "s": 0.3 }
    }
  }
}
```

上例会：改人格名为「林晚」、替换 `intimate` 事件的全部台词、把初始心情压到偏冷、初始安全感降到偏低。其余 19 个一级键（`events`、`cfg`、`labels`……）全部继承默认。

优先级：**chat 变量 > character 变量**。同一角色想在不同对话里用不同人格时，写 chat 变量即可。

### 写法 2：扩展私有变量

扩展设置面板里写入 `.profile`（结构同上，但不含外层 `persona_engine_profile` 包壳）。适合「我所有角色都想改某个默认值」。

### 写法 3：代码里显式传入（测试用）

```js
import { DEFAULT_PROFILE } from './src/defaults.js'
import { createEngine } from './src/engine.js'

const e = createEngine('chat-id', {
  profile: { ...DEFAULT_PROFILE, meta: { name: '测试' } }
})
```

在集成层（`integration.js`）里，`resolveProfile()` 会自动按三级优先级算好并交给引擎。

---

## 三、全部可覆盖键一览（19 个一级键）

### `meta`

```jsonc
{ "name": "通用人格", "version": "0.3.1" }
```

- `name`：注入头里 `{{char}}` 之外的显示名，也用于日志。**改这个就等于给引擎换了张脸。**

### `initial` ⭐ 初始姿态

```jsonc
{
  "af":   { "v": 0.15, "a": 0.25, "s": 0.5, "u": 0.35, "c": 0.2, "ct": 0.3, "bc": 0.3 },
  "self": { "esteem": 0.3, "efficacy": 0.3, "coherence": 0.5 }
}
```

- 引擎 `reset()` 从这里读初始值，**不再硬编码**。
- 全中性、略偏稳态。想让角色「天生警惕」，就把 `s` 压到 `0.2`、`u` 抬到 `0.6`。
- 七维含义：
  - `v` valence 心情（-1 冷 ~ 1 暖）
  - `a` arousal 张力（0 松弛 ~ 1 紧绷）
  - `s` safety 安全感
  - `u` uncertainty 不确定感
  - `c` connection 连接感
  - `ct` comfort 舒适度
  - `bc` boundary comfort 边界舒适
- `self` 是自我模型：`esteem` 自尊、`efficacy` 效能感、`coherence` 一致感。
- 非法值（非数字/NaN/Infinity）自动退回上表默认值（`num()` 兜底）。

### `cfg` 子系统系数

分组：`confidence_cap`、`confidence_growth`、`feel.*`、`intuition.*`、`memory.*`、`pattern.*`、`belief.*`、`person.*`、`self_model.*`、`goal.*`、`decision.*`。

调参入口举例：
- 想「更容易记住事」：调大 `memory.max_memories`、调小 `memory.forget_threshold`。
- 想「更敏感/更钝」：改 `feel.severity_weight`、`feel.novelty_arousal_weight`。
- 想「更谨慎/更主动」：改 `decision.approach_threshold`、`decision.avoid_threshold`、`decision.boundary_avoid_weight`。

### `labels` 数值分带词

```jsonc
{
  "valence": { "warm": 0.25, "cold": -0.25, "neutral": "平静" },
  "arousal": { "tense": 0.65, "relaxed": 0.3, "neutral": "平稳" },
  "safety":  { "safe": 0.6, "unsafe": 0.35, "neutral": "尚可" }
}
```

语义（v0.3.1 起修正）：

- 表内**阈值最高**的键是「高方向名」；**阈值最低**的键是「低方向名」。
- `value >= 高阈值` → 高方向名；`value < 低阈值` → 低方向名；两者之间 → `neutral`。
- `neutral` 可省略，省略则中间带输出空串（不建议，会让注入出现「心情:」这样的空标签）。
- 单键表（只有一个方向）也兼容：视为「低阈值方向」。

> 想把「高安全感」叫「安心」，只改 `labels.safety.safe` 的值或名字即可，**不必动代码**。

### `events` 事件表（**数组 → 整体替换**）

引擎靠它在文本里检测事件。默认表覆盖 `intimate / praise / comfort / apology / promise_kept / help_offered / reject / threat / coercion / promise_broken / retreat`。

想加自定义事件（比如 `gift`），必须提供**完整** `events` 数组（不能只追加），并在 `feel` / `effect` / `beliefs` / `memoryText` / `lines` 里补上对应键。

### `feel` 事件 → 情绪基准

`event_valence_impact`（情绪好坏）与 `event_arousal_impact`（激动程度）两张映射表。

### `effect` 事件 → 各维度增量

分组：`uncertainty` / `safety` / `comfort` / `trust` / `attach` / `connection`。数值直接叠加到七维。

### `lines` 表态台词（**数组 → 整体替换**）

按事件 id 给一组候选台词，引擎随机取一句。特殊键：
- `default`：无匹配事件时的兜底台词。
- 台词里的 `{{user}}` / `{{char}}` 会在注入时被替换为实际名字。

### `beliefs` 事件 → 信念

`{ b: "信念文本", v: 权重 }`。反复触发会累积成「根深蒂固的念头」。

### `memoryText` 事件 → 记忆短句

一句话概括这次经历，进入「最近留在心里的」。

### `goals` 需求 → 想要的东西

键是需求名：`default` / `safety` / `connection` / `autonomy` / `competence` / `predictability`。文案里可用 `{{user}}`。

### `reasons` 决策倾向 → 理由文案

`withdraw` / `approach` / `guard` / `observe` / `observe_predictability`。

### `selfEffects` 事件 → 自我模型白名单

`esteem_up` / `esteem_down` / `coherence_down`，值为事件 id 数组（**数组整体替换**）。

### `mood` 心情规则

```jsonc
{
  "rules": [
    { "label": "低落", "cmp": "v < -0.3 && a < 0.5" },
    { "label": "不安", "cmp": "u > 0.6" }
  ],
  "fallback": "平静"
}
```

- `rules` 数组按顺序求值，第一个命中即返回该 `label`。
- `cmp` 走**安全求值**（`evalCmp`），可用变量：`v a s u c ct bc` 与 self 的 `esteem efficiency coherence`。
- 全部未命中 → `fallback`。

### `afText` / `personText` 文本呈现字段

```jsonc
{ "afText": { "segments": ["心情", "张力", "安全感", "连接", "边界舒适", "不确定"] },
  "personText": { "fields": ["可信", "边界", "修复", "契合"] } }
```

- 改 `segments` 的名字就等于改注入里的字段名（**数组整体替换**，顺序即展示顺序）。
- `personText.fields` 同理，作用于「对身边人的判断」。

### `stateText` 状态块文案

`title` / `mood_prefix` / `intent_prefix` / `goals` / `memories` / `beliefs` / `persons`。改它即可完全定制注入块的小标题用词。

### `inject` 注入控制

```jsonc
{
  "depth": 4,
  "role": "system",
  "header": "【{{char}}的内心】……",
  "footer": "……",
  "show": ["labels", "summary"]
}
```

- `header` / `footer`：注入文本的头尾，支持 `{{char}}` / `{{user}}`。
- `depth`：注入到倒数第几条消息。
- `show`：`labels`（七维分带词）、`summary`（状态摘要）等段落开关（**数组整体替换**）。

### `bounds` / `mvu`

- `bounds`：MVU 桥的 0–10 量纲界（`low` / `high` / `initial`），**与七维无关**。
- `mvu`：MVU 桥开关，默认关。`{ "enabled": false, "path": "persona_engine" }`。

---

## 四、最小可用示例：做一个「天生冷淡但会慢慢暖」的角色

```json
{
  "persona_engine_profile": {
    "meta": { "name": "霜" },
    "initial": {
      "af": { "v": -0.2, "a": 0.15, "s": 0.25, "u": 0.6, "c": 0.1, "ct": 0.15, "bc": 0.2 }
    },
    "lines": {
      "default": ["……", "嗯。", "（没抬头。）"],
      "intimate": ["（僵了一下，没躲开。）", "……别靠太近。"]
    },
    "goals": {
      "connection": "（还不想承认）想离{{user}}近一点"
    },
    "labels": {
      "valence": { "warm": 0.35, "cold": -0.1, "neutral": "漠然" }
    }
  }
}
```

只写了 5 个一级键，其余 14 个自动继承默认。开局是「漠然 / 高戒备」，但随着 `intimate`、`comfort` 事件累积，`v` 与 `s` 会被引擎自然推上去——**冷淡是可被打破的，而不是写到死**。

---

## 五、常见坑

1. **数组是整体替换**。只写半个 `events` 或 `lines.intimate` 的一个元素，会丢掉原有整张表——要替换就写全量。
2. **键名大小写敏感**，`initial` 与 `Initial` 是两回事。
3. **`neutral` 别省**。省了之后中间态输出空串，注入里会出现「心情: 安全感:」这种空标签。
4. **`mood.rules` 的 `cmp` 是字符串表达式**，不是对象。写错只会静默落到 `fallback`。
5. **`events` 与四个配套表要成组改**。加了事件 id 却不在 `lines` / `effect` 里给对应键，该事件不会产生可见效果。
6. **改动只在 `reset()` 时读 `initial`**。想让某个角色「从某个状态继续」，应该在卡变量里持久化运行时状态，而不是反复改 `initial`。

---

## 六、不想写 profile？

不做任何配置也能用：默认 `meta.name` 是「通用人格」，初始姿态中性，事件与文案都是通用中文。
**profile 是让你把「通用」收窄成「这一个角色」，不是使用前提。**
