# 人格引擎 (Persona Engine)

为 SillyTavern 提供「角色内心状态持续演化」的通用引擎。基于 [酒馆助手 (JS-Slash-Runner)](https://github.com/N0VI028/JS-Slash-Runner) 的扩展接口构建。

> 起源是「希言认知」角色卡内嵌脚本。改造为通用扩展后，任何角色卡都可以接入，只要提供一套「台词包」。
> 详细设计见 [`docs/DESIGN.md`](docs/DESIGN.md)。

## 它做什么

给角色一套会随对话变化的七维情感向量（valence / arousal / safety / uncertainty / comfort / connection / boundary），并：

- 每回合根据消息内容**检测事件**，按事件权重更新七维
- 由七维**派生**心情、记忆、目标、决策与台词
- 把当前状态**注入到上下文**，让模型「记得自己现在什么心情」
- 注册**宏**与**斜杠命令**，让卡或用户随时读写状态

## 依赖

需要已安装 **酒馆助手 (JS-Slash-Runner) ≥ 4.9.5**（`manifest.json` 中声明）。

## 安装

1. 使用仓库里已构建好的 `dist/index.js`（无需自己构建）
2. 把整个目录放进：

```
SillyTavern/public/scripts/extensions/third-party/人格引擎/
```

3. 在 ST 扩展面板启用

## 配置优先级

**三级深合并**：

```
角色卡内数据  >  扩展设置面板  >  内置兜底默认值
```

- **内置兜底**（`src/defaults.js`）：`DEFAULT_PROFILE`，开箱即用。
- **扩展设置面板**：给「没有特殊需求」的卡用的通用台词包，一次配置全局生效。
- **角色卡内数据**：某张卡要说自己的话，在卡里写入覆盖项即可，**不需要改扩展代码**。

合并规则：**对象递归合并，数组整体替换**。卡里只写差异部分，未覆盖的 key 自动沿用默认值。

卡内覆盖的读取 key 是 `persona_engine_profile`（见 `src/config.js` 的 `CARD_OVERRIDE_KEY`）。卡内优先读 `character` 作用域，无则读 `chat` 作用域。

## 台词包结构

引擎的行为全部由「台词包」参数化。默认包见 `src/defaults.js`。

```js
{
  meta:   { name, version },              // 台词包标识
  cfg:    { /* 九个子系统开关 */ },
  labels: { /* 各维度显示名 */ },
  events: [ { id, pattern, z, effect } ], // 事件：正则 → 权重 → 维度增量
  lines:  { <eventId>: [ "台词", ... ] }, // 按事件 id 索引的台词
  beliefs:{ ... },                        // 信念
  mood:   { rules: [ ... ] },             // 心情规则
  inject: { header, template, ... }        // 注入格式
}
```

### events（最容易写错的地方）

```js
{ "id": "intimate", "pattern": "拥抱|(?:抱)(?!歉)|牵手", "z": 0.75, "effect": { "valence": 0.35, "arousal": 0.15 } }
```

| 字段 | 说明 |
| --- | --- |
| `id` | 事件类型，**必填**；同时是 `lines` 等下游表的索引键 |
| `pattern` | 正则**字符串**（不是 RegExp 字面量），对每条消息检测 |
| `z` | 置信权重，默认 0.7。命中时取 z 最高者 |
| `effect` | 维度增量，**数值**（不是 `"+2"` 字符串） |

> ⚠️ **不要写 `抱|拥抱` 这种朴素正则。** 中文里有子串陷阱：`抱` 会命中「抱**歉**」，
> 而 `intimate` 的 z 高于 `apology`，结果**每句道歉都被判成亲密**。
> 正确写法是加负向前瞻：`(?:抱)(?!歉)`。
> 同样地，`是我的错`（自我责备）与 `是我错了`（道歉）极易互相误伤。
> **每加一条事件，都请过一遍子串审查。** 详见 `docs/DESIGN.md` 第 4 节。

### lines

台词按 **event id** 索引，是模板字符串，支持 `{{user}}` / `{{char}}`。

```js
lines: { "apology": ["这次算了。"], "default": ["……"] }
```

### inject

```js
{ "header": "【内心】", "template": "..." }
```

## 对外接口

**宏**：`{{pe_mood}}` `{{pe_feel}}` `{{pe_state}}` `{{pe_person}}` `{{pe_goal}}` `{{pe_line}}`

**斜杠命令**：`/pe-state` `/pe-mood` `/pe-feel` `/pe-person` `/pe-goal` `/pe-refresh` `/pe-reset`

**JS API**（`globalThis.personaEngine`）：`get()` `profile()` `state()` `mood()` `feel()` `reset()` `inject()` `push(bool)` `reload()`

完整说明见 `docs/DESIGN.md` 第 5 节。

## 开发

```bash
# 构建（无需 package.json，直接用 npx）
npx esbuild src/integration.js --bundle --format=esm --target=es2020 --outfile=dist/index.js

# 冒烟测试（Node 直跑，不接酒馆）
node test/smoke.mjs    # 期望 PASS 58 / FAIL 0 / EXIT=0
```

本扩展**用 esbuild 打包**：`src/` 多文件，`dist/index.js` 是 bundle 产物，**已随仓库一并提交**，clone 下来即可直接用。
之所以不上 TS/vite，是因为要在手机上跨设备开发，`npx esbuild` 一条命令即可，零配置。
如果你改了 `src/`，记得重新构建并提交 `dist/index.js`。

## 目录

```
manifest.json         ST 扩展清单（js → dist/index.js）
src/engine.js         核心状态机（buildEvents / detect / evolve / 七维演化）
src/config.js         三级配置解析（deepMerge / resolveProfile）
src/defaults.js       内置默认档案 + 11 条默认事件
src/integration.js    与酒馆的胶水层（事件/注入/宏/斜杠/API）
test/smoke.mjs        58 条断言
dist/index.js         构建产物
docs/DESIGN.md        设计说明
```

## 许可

MIT