# 人格引擎 · 设计说明

> 一个挂在酒馆助手（JS-Slash-Runner）上的通用「人格引擎」扩展。
> 它把「角色怎么感受、怎么记住、怎么开口」从角色卡里抽出来，做成可复用、可覆盖、可测试的状态机。
>
> 血统：这套算法骨架来自「希言认知 v4」。改造要点只有一个——**把专属数据从逻辑里剥离**，
> 让引擎认得的是「事件」，而不是「希言」。

---

## 1. 为什么是扩展，不是卡内脚本

卡内脚本有三个绕不开的问题：

| 问题 | 卡内脚本 | 人格引擎扩展 |
| --- | --- | --- |
| 复用 | 每张卡复制一份，改一处要改 N 处 | 装一次，所有卡共用 |
| 升级 | 用户得手动替换脚本 | 改 dist 即可 |
| 测试 | 只能在酒馆里跑，靠肉眼 | Node 里跑 `test/smoke.mjs`，58 条断言 |
| 数据 | 数据和逻辑混在一起 | 三级覆盖，卡可只写差异 |

代价是：**引擎必须对「角色是谁」一无所知**。所有倾向性内容都在数据层。

---

## 2. 三级优先级：档案从哪来

```
DEFAULT_PROFILE  (src/defaults.js，兜底)
      ↑ 深合并
extension 设置   (酒馆助手里配置的 profile)
      ↑ 深合并
角色卡内数据     (character.data，优先；无则 chat 级)
```

`resolveProfile()` 逐层 `deepMerge`。合并规则：

- **对象**：递归合并，未覆盖的 key 原样保留。
- **数组**：**整体替换**，不做元素级合并。

> ⚠️ 数组整体替换是刻意的。事件表若做元素合并，卡作者想「删掉一条默认事件」就做不到。
> 想改事件表？在卡里给 `events` 一个完整数组。

卡内数据的读取 key 是 `persona_engine_profile`（见 `config.js` 的 `CARD_OVERRIDE_KEY`）。

---

## 3. 核心数据结构

### 3.1 `af` 七维情感向量

```js
{ v, a, s, u, c, ct, bc }
```

分别代表 valence（情绪正负）、arousal（唤醒度）、safety（安全感）、uncertainty（不确定）、
comfort（舒适）、connection / attach（连接与依恋）、boundary（边界感）。

七维是引擎的**唯一状态源**：心情、台词、决策、注入文本全部从它派生。
`effect` 表按维度索引，事件命中后按表加减——这是「事件改变性格」的唯一通道。

### 3.2 事件表 `events`

```js
{ id: 'praise', pattern: '真好|很棒|厉害|喜欢你|谢谢你|辛苦了', z: 0.7, effect: { valence: 0.2 } }
```

- `id` —— 事件类型，同时是 `lines` / `boundary_delta` / `attach` / `comfort` 等下游表的索引键。
- `pattern` —— 正则**字符串**（不是 RegExp 字面量，便于 JSON 承载）。
- `z` —— 置信权重，见 3.3。
- `effect` —— 该事件对七维的增量。

### 3.3 `z` 与命中选取策略

`detect()` 扫描窗口取**文本末尾 600 字**，收集全部命中后：

```js
hits.sort((a, b) => b.z - a.z || b.p.length - a.p.length)
```

**取 z 最高的一条；同 z 取匹配子串最长的。** 没有任何命中则返回
`{ t: 'neutral', z: 0.3, p: '', effect: {} }` —— 引擎永不抛错，永远有返回值。

默认 11 条事件的 z 从高到低：

| z | 事件 | 说明 |
| --- | --- | --- |
| 0.85 | `threat` / `coercion` | 威胁、胁迫——最高优先级，安全第一 |
| 0.80 | `promise_broken` | 失约 |
| 0.78 | `promise_kept` / `reject` | 守信、拒绝 |
| 0.75 | `intimate` | 亲密 |
| 0.72 | `apology` / `help_offered` | 道歉、示好 |
| 0.70 | `praise` / `comfort` | 夸奖、安慰 |
| 0.68 | `retreat` | 退缩 |

> **设计原则：z 越高，事件越「不可错过」。** 安全类事件压过一切，
> 因为漏判一次威胁的代价，远大于误判一次安慰。写卡内事件表时请保持这个原则。

---

## 4. ⚠️ 已知陷阱（都是真实踩过的）

### 4.1 中文子串陷阱：`抱歉` 里的 `抱`

原始 `intimate` 正则是 `抱|拥抱|牵手|靠着|贴近|依偎`。
看起来没问题，直到遇见：

> 「很**抱歉**，我不该这样。」

`抱` 命中了 `抱歉` 的第一个字。而 `intimate` 的 z（0.75）**高于** `apology`（0.72），
于是**每一句道歉都被判成了亲密**——连带 `af.v`、`af.s`、`af.ct` 的走向、
`intimate` 专属台词、`boundary_delta.intimate` 全部跑偏。

修复（`docs` 里留档，因为这类 bug 会复发）：

```js
pattern: '拥抱|(?:抱)(?!歉)|牵手|靠着|贴近|依偎'
// 注意：`抱` 必须排除「抱歉」，否则任何道歉都会被误判成亲密（中文子串陷阱）。
```

用**负向前瞻** `(?!歉)` 排除掉「抱」后面跟「歉」的情况，同时保留「抱你」「抱抱」的正常命中。

`test/smoke.mjs` 的 **5c 节**专门锁死这条：

```
✓ 抱歉 → apology
✓ 对不起 → apology
✓ 抱你 → intimate
```

> **写自定义事件表时，请对每个中文关键词做子串审查。**
> 高危组合往往是「短词是长词的前缀或子串」，例如「是我的错」与「是我错了」，「不想吃」与「想吃」。
> 命中最长的子串**不能**解决问题——`z` 优先于长度，z 一旦配错，长匹配也救不回来。

### 4.2 `detect()` 只吃「编译后事件」

`detect(txt, events)` 里的 `events` 必须是 `buildEvents()` 的产物：

```js
{ t: 'intimate', re: /.../ , z: 0.75, effect: {...} }   // ✅ 编译后
{ id: 'intimate', pattern: '...', z: 0.75, effect: {...} } // ❌ 原始形态（DEFAULT_EVENTS）
```

传错形态**不会报错**：`e.re` 是 `undefined`，`s.match(undefined)` 静默返回 `null`，
`detect` 就返回一个看起来「很正常」的 neutral。极易被误读成「引擎没命中」。

**正确用法——永远通过引擎实例拿编译后的事件：**

```js
const eng = createEngine('some_chat_id');
eng.events // {t, re, z, effect}[]
eng.evolve(txt, speaker, target, isUser) // 推荐：这才是「让状态动起来」的入口
```

`z` 的比较是数字比较；`re` 是 `RegExp` 实例——`JSON.stringify` 会把它序列化成 `{}`，
这是 JS 特性不是 bug，别被骗。

### 4.3 「没 evolve」不等于「引擎坏了」

`detect()` 是**纯函数**：它只看文本、返回判定，**不改任何状态**。
如果你怀疑「为什么记忆是空的」，先确认你调用过 `evolve()`。

`test/smoke.mjs` 第 7 节因此拆成两半：

```
✓ 未 evolve 时没有记忆  (0)      ← 负向断言，防止把「空状态」当「功能失效」
✓ evolve 后产生了记忆  (1)
```

> 这条教训是双向的：上一轮我们抓到了「测试全绿但功能全废」的**假阳性**
> （`events` 字段整个丢失，11 条事件一条都不在）；这一轮抓到了
> 「测试部分飘红但引擎没错」的**假阴性**（样例文本写错字）。
> **断言必须同时锚定「数据契约」（有 events 吗）与「语义正确」（抱歉该是道歉吗）。**

### 4.4 卡里写错正则不会让引擎挂掉

`buildEvents()` 里 `new RegExp(e.pattern)` 包在 try/catch 中，失败就 `continue` 跳过该条。
**保护了健壮性，代价是静默失效。** 改完事件表，请跑 `test/smoke.mjs`
的第 2 节（正则可编译）和第 5 节（11 条都能命中），确认没有事件被悄悄丢掉。

---

## 5. 对外接口

### 5.1 助手宏（`{{...}}`）

| 宏 | 内容 |
| --- | --- |
| `{{pe_mood}}` | 当前心情 |
| `{{pe_feel}}` | 七维情感向量 |
| `{{pe_state}}` | 完整内心状态 |
| `{{pe_person}}` | 对身边人的判断 |
| `{{pe_goal}}` | 此刻的目标 |
| `{{pe_line}}` | 此刻会说出口的话 |

宏注册失败会记日志并跳过，不影响扩展加载。

### 5.2 斜杠命令

| 命令 | 作用 |
| --- | --- |
| `/pe-state` | 查看完整内心状态 |
| `/pe-mood` | 查看心情 |
| `/pe-feel` | 查看七维向量 |
| `/pe-person` | 查看对人的判断 |
| `/pe-goal` | 查看目标 |
| `/pe-refresh` | 重新解析 profile 并重注入 |
| `/pe-reset` | 清空记忆与状态 |

### 5.3 JS API（`globalThis.personaEngine`）

```js
personaEngine.get()      // 取引擎实例（编译后事件在这里）
personaEngine.profile()  // 取解析后的完整档案
personaEngine.state()    // 完整状态文本
personaEngine.mood()     // 心情
personaEngine.feel()     // 七维文本
personaEngine.reset()    // 重置状态
personaEngine.inject()   // 重新注入提示
personaEngine.push(bool) // 回写 MVU 变量
personaEngine.reload()   // 强制重解析 profile
personaEngine.version    // '0.1.0'
```

### 5.4 引擎实例方法

```js
eng.evolve(txt, speaker, target, isUser) // 主入口：判定 + 演化 + 产生记忆/目标/决策
eng.mood()      // 心情（走 mood.rules）
eng.afText()    // 七维文本
eng.fullState() // 完整状态
eng.personText()/goalsText()
eng.reset()
eng.lastEvent   // 最近一次命中 { t, ... }
eng._act0       // 最近一次决策 { intent, line }
```

---

## 6. 构建与测试

```bash
# 构建（无需 package.json）
npx esbuild src/integration.js --bundle --format=esm --target=es2020 --outfile=dist/index.js

# 冒烟测试
node test/smoke.mjs    # 期望 PASS 58 / FAIL 0 / EXIT=0
```

`manifest.json` 的 `js` 指向 `dist/index.js`。**`dist/` 是产物，但已随仓库提交**（`.gitignore` 不排除它）——
因为 ST 用户几乎不会自己去跑 esbuild，仓库里没有可加载文件就等于装不上。
改完 `src/` 后请重新构建并把 `dist/index.js` 一并提交。
（`manifest.json` 里不要留 `css` 字段，除非真的写了 `dist/index.css`——否则加载时会 404。）

### 测试覆盖的五个层面

| 节 | 层面 |
| --- | --- |
| 1–4 | **结构契约**：字段齐全、正则可编译、事件不丢、实例可建 |
| 5 / 5b | **语义正确**：11 条事件既「能被句子命中」也「能被自己的样例命中」 |
| 5c | **回归锁**：`抱歉` 子串陷阱 |
| 6 | **输出接口**：宏/注入无残留 `{{char}}` |
| 7–8 | **演化方向**：夸奖抬 valence、胁迫压 safety 并生成负面信念 |
| 9 | **覆盖优先级**：深合并、未覆盖保留、数组替换、事件不丢 |

---

## 7. 怎么给一个角色写档案（「台词包」）

引擎只认事件和表，不认角色。给角色做适配 = 提供一份**覆盖档**：

```json
{
  "meta": { "name": "角色名" },
  "events": [ { "id": "being_called_sister", "pattern": "妹妹|囡囡", "z": 0.7, "effect": { "valence": 0.2 } } ],
  "lines": { "being_called_sister": ["……别这么叫。"] },
  "beliefs": { "...": "..." },
  "mood": { "rules": [ ... ] }
}
```

放在角色卡的 `persona_engine_profile` 里即可。默认档案里的 key 不用重复写，
三层深合会保留。

> **台词包的红线：每条自定义 `pattern` 都要过一遍 4.1 的子串审查。**
> 以「希言」为例，`self_blame` 的 `是我的错` 与 `apology` 的 `是我错了` 高度接近，
> 不审查就可能出现「道歉被识别成自我责备」。这类问题只能靠测试兜住——
> 每加一条事件，就在 `test/smoke.mjs` 的样例表里加一行。

---

## 8. 目录结构

```
人格引擎/
├── manifest.json          # 指向 dist/index.js
├── src/
│   ├── defaults.js        # DEFAULT_PROFILE：兜底档案 + 11 条默认事件
│   ├── config.js          # EXTENSION_ID / CARD_OVERRIDE_KEY / deepMerge / resolveProfile
│   ├── engine.js          # 核心状态机：buildEvents / detect / evolve / 七维演化
│   └── integration.js     # 酒馆粘合层：事件监听 / 宏 / 命令 / API / init
├── test/
│   └── smoke.mjs          # 58 条断言，Node 直跑
├── dist/                  # 构建产物（已入库，勿手改）
│   └── index.js           # esbuild bundle，manifest 的 js 指向它
└── docs/
    └── DESIGN.md          # 本文档
```
