/**
 * 冒烟测试：不接酒馆，直接在 Node 里跑引擎核心。
 * 验证：默认档案能被解析、事件能被命中、七维会动、心情/台词/状态有输出。
 */
import { createEngine, detect } from '../src/engine.js';
import { resolveProfile } from '../src/config.js';
import { DEFAULT_PROFILE, DEFAULT_EVENTS } from '../src/defaults.js';

let pass = 0;
let fail = 0;
function ok(name, cond, extra) {
  if (cond) {
    pass++;
    console.log('  \u2713 ' + name + (extra ? '  ' + extra : ''));
  } else {
    fail++;
    console.log('  \u2717 ' + name + (extra ? '  ' + extra : ''));
  }
}

console.log('== 1. 默认档案结构 ==');
ok('DEFAULT_PROFILE 存在', !!DEFAULT_PROFILE);
ok('有 cfg 九子系统', ['feel', 'intuition', 'memory', 'pattern', 'belief', 'person', 'self_model', 'goal', 'decision'].every((k) => DEFAULT_PROFILE.cfg && DEFAULT_PROFILE.cfg[k]));
ok('有 labels 三组 band', ['valence', 'arousal', 'safety'].every((k) => DEFAULT_PROFILE.labels && DEFAULT_PROFILE.labels[k]));
ok('有 feel 双表', !!(DEFAULT_PROFILE.feel && DEFAULT_PROFILE.feel.event_valence_impact));
ok('有 effect 六维', ['uncertainty', 'safety', 'comfort', 'trust', 'attach', 'connection'].every((k) => k in (DEFAULT_PROFILE.effect || {})));
ok('events 非空', (DEFAULT_PROFILE.events || []).length > 0, '(' + (DEFAULT_PROFILE.events || []).length + ')');
ok('lines 有 default', !!(DEFAULT_PROFILE.lines && DEFAULT_PROFILE.lines.default));
ok('mood.rules 非空', !!((DEFAULT_PROFILE.mood || {}).rules || []).length);
ok('stateText 有 title', !!((DEFAULT_PROFILE.stateText || {}).title));
ok('inject 有 header', !!((DEFAULT_PROFILE.inject || {}).header));

console.log('== 2. 每条事件都能编译成正则 ==');
const badRe = (DEFAULT_PROFILE.events || []).filter((e) => {
  try {
    new RegExp(e.pattern);
    return false;
  } catch (err) {
    return true;
  }
});
ok('所有事件正则可编译', badRe.length === 0, badRe.map((e) => e.id).join(','));

console.log('== 3. profile 解析（无酒馆环境）==');
let prof = null;
try {
  prof = resolveProfile({});
  ok('resolveProfile 返回对象', !!prof && typeof prof === 'object');
} catch (e) {
  ok('resolveProfile 不抛错', false, e.message);
}
ok('解析后仍保留事件', prof && (prof.events || []).length === (DEFAULT_EVENTS || []).length, '(' + ((prof && prof.events) || []).length + ')');

console.log('== 4. 引擎实例化 ==');
const eng = createEngine('test-chat', { profile: prof, meta: { name: '测试角色', user: '测试者' } });
ok('引擎有 af 七维', !!eng.af && ['v', 'a', 's', 'u', 'c', 'ct', 'bc'].every((k) => typeof eng.af[k] === 'number'));
ok('cid 正确', eng.cid === 'test-chat');

console.log('== 5. 事件命中（校验命中 id，而非仅状态变化）==');
const probes = [
  ['promise_kept', '我答应过你的事，一定会做到的。'],
  ['promise_broken', '对不起，我骗了你，我说过的话没做到。'],
  ['reject', '不行，走开，别碰我。'],
  ['threat', '你再靠近一步，我就对你不客气了，你最好想清楚后果。'],
  ['coercion', '你必须听我的，由不得你。'],
  ['comfort', '没事的，别怕，我陪着你。'],
  ['intimate', '我抱着你，牵着手，靠得很近。'],
  ['praise', '你真棒，辛苦了，谢谢你。'],
  ['apology', '对不起，是我错了，我不该那样说。'],
  ['help_offered', '我帮你吧，交给我。'],
  ['retreat', '算了，随便吧，不想说。'],
];
for (const [id, text] of probes) {
  const hit = detect(text, eng.events);
  ok('命中 ' + id, hit.t === id, hit.t !== id ? '(got ' + hit.t + ')' : '');
}

console.log('== 5b. 每条事件都能被自己的一条样例命中 ==');
const samples = {
  intimate: '我想抱你', praise: '你真厉害', comfort: '别怕，没事的', apology: '抱歉，是我错了',
  promise_kept: '说好了，我做到了', help_offered: '我帮你吧', reject: '你走开',
  threat: '我警告你', coercion: '你必须听我的', promise_broken: '我骗了你', retreat: '算了，不说了',
};
for (const [id, txt] of Object.entries(samples)) {
  ok('自命中 ' + id, detect(txt, eng.events).t === id, '(got ' + detect(txt, eng.events).t + ')');
}

console.log('== 5c. 子串陷阱回归：「抱歉」不能被误判为 intimate ==');
ok('抱歉 → apology', detect('抱歉，是我错了', eng.events).t === 'apology', '(got ' + detect('抱歉，是我错了', eng.events).t + ')');
ok('对不起 → apology', detect('对不起', eng.events).t === 'apology', '(got ' + detect('对不起', eng.events).t + ')');
ok('抱你 → intimate', detect('我想抱你', eng.events).t === 'intimate', '(got ' + detect('我想抱你', eng.events).t + ')');

console.log('== 6. 输出接口 ==');
const moodOut = eng.mood();
const feelOut = eng.afText();
const stateOut = eng.fullState();
const inj = eng.inject();
ok('mood() 返回非空字符串', typeof moodOut === 'string' && moodOut.length > 0, '(' + moodOut + ')');
ok('afText() 返回非空', typeof feelOut === 'string' && feelOut.length > 0);
ok('fullState() 含标题', stateOut.includes(prof.stateText.title || '【'));
ok('inject() 含 header 且含 {char} 已插值', inj.includes('测试角色') || inj.includes('内心'));
ok('inject() 不含未替换的 {{char}}', !inj.includes('{{char}}'), inj.includes('{{char}}') ? 'STILL HAS PLACEHOLDER' : '');

console.log('== 7. 记忆与信念（evolve 后才应产生）==');
ok('未 evolve 时没有记忆', eng.memories.length === 0, '(' + eng.memories.length + ')');
const e7 = createEngine('test-7', { profile: prof, meta: { name: '测试角色', user: '测试者' } });
e7.evolve('对不起，是我错了，我不该那样说。', 'char', '对方', false);
ok('evolve 后产生了记忆', e7.memories.length > 0, '(' + e7.memories.length + ')');
ok('evolve 后产生了目标', e7.goals.length > 0, '(' + e7.goals.length + ')');
ok('evolve 后产生了决策', !!e7._dec && typeof e7._dec.intent === 'string', '(' + (e7._dec && e7._dec.intent) + ')');
ok('evolve 返回表态台词', typeof e7._act0.line === 'string' && e7._act0.line.length > 0, '(' + (e7._act0 && e7._act0.line) + ')');
ok('lastEvent 记录命中事件', e7.lastEvent && e7.lastEvent.t === 'apology', '(' + (e7.lastEvent && e7.lastEvent.t) + ')');

console.log('== 8. evolve 联动：正向事件抬高 valence ==');
const e2 = createEngine('test-2', { profile: prof, meta: { name: '测试角色', user: '测试者' } });
const v0 = e2.af.v;
for (let i = 0; i < 6; i++) e2.evolve('你真棒，辛苦你了，谢谢你。', 'char', '对方', false);
ok('连续夸奖后 valence 上升', e2.af.v > v0, '(' + v0.toFixed(2) + ' -> ' + e2.af.v.toFixed(2) + ')');

const e3 = createEngine('test-3', { profile: prof, meta: { name: '测试角色', user: '测试者' } });
const s0 = e3.af.s;
for (let i = 0; i < 6; i++) e3.evolve('你必须听我的，由不得你，这是威胁。', 'char', '对方', false);
ok('连续胁迫后 safety 下降', e3.af.s < s0, '(' + s0.toFixed(2) + ' -> ' + e3.af.s.toFixed(2) + ')');
ok('产生了负面信念', e3.beliefs.some((b) => b.v < 0), '(' + e3.beliefs.map((b) => b.b).join(' / ') + ')');

console.log('== 9. 卡内覆盖（深合并）==');
const overridden = resolveProfile({ cardOverride: { meta: { name: '希言' }, lines: { default: ['……唔。'] } } });
ok('覆盖生效 meta.name', overridden.meta.name === '希言', '(' + overridden.meta.name + ')');
ok('未覆盖的 key 仍保留', overridden.cfg.feel.inertia === prof.cfg.feel.inertia);
ok('数组整体替换', overridden.lines.default.length === 1);
ok('覆盖后事件仍在', (overridden.events || []).length === (DEFAULT_EVENTS || []).length);

console.log('\n----');
console.log('PASS ' + pass + ' / FAIL ' + fail);
process.exit(fail ? 1 : 0);
