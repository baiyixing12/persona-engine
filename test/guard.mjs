
import { createEngine } from '/root/persona-engine/src/engine.js';
import DEFAULT_PROFILE from '/root/persona-engine/src/defaults.js';

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  V ' + name + (extra ? '  (' + extra + ')' : '')); }
  else { fail++; console.log('  X ' + name + '  ' + (extra || '')); }
}
const clone = (o) => JSON.parse(JSON.stringify(o));

console.log('== G1. defaults persona_guard schema ==');
const g0 = DEFAULT_PROFILE.persona_guard;
ok('persona_guard defined', !!g0);
ok('enabled default true', g0 && g0.enabled === true);
ok('always default true', g0 && g0.always === true);
ok('has header/footer', !!(g0 && g0.header && g0.footer));
ok('4 arrays present', ['identity','voice','forbidden','drift_rules'].every(k => Array.isArray(g0[k])));
ok('gen block present', !!(g0 && g0.gen && typeof g0.gen === 'object'));
console.log('== G2. enabled but empty content -> empty (short-circuit) ==');
const e1 = createEngine('t1', { profile: clone(DEFAULT_PROFILE) });
ok('default enabled still yields empty guard', e1.guard() === '');
const e1off = createEngine('t1b', { profile: (() => { const p = clone(DEFAULT_PROFILE); p.persona_guard.enabled = false; return p; })() });
ok('explicitly disabled -> empty guard', e1off.guard() === '');

console.log('== G3. enabled -> content + interpolation ==');
const prof = clone(DEFAULT_PROFILE);
prof.persona_guard.enabled = true;
prof.persona_guard.identity = ['{{char}} is an AI cognition entity'];
prof.persona_guard.voice = ['{{char}} speaks in short sentences'];
prof.persona_guard.forbidden = ['never say NOT_YOUR_FAULT'];
const e2 = createEngine('t2', { profile: prof });
e2.meta = { name: 'Xiyan', user: 'you' };
const gv = e2.guard();
ok('guard non-empty', gv.length > 0);
ok('no raw {{char}}', !gv.includes('{{char}}'));
ok('char name interpolated in items', gv.includes('Xiyan is an AI cognition entity'));
ok('has forbidden item', gv.includes('NOT_YOUR_FAULT'));

console.log('== G4. drift_rules via evalCmp short keys ==');
const prof2 = clone(DEFAULT_PROFILE);
prof2.persona_guard.enabled = true;
prof2.persona_guard.drift_rules = [{ when: 's < 0.30', then: 'RETREAT_MARKER' }];
const e3 = createEngine('t3', { profile: prof2 });
ok('default not hit (s=0.50)', !e3.guard().includes('RETREAT_MARKER'), 's=' + e3.af.s.toFixed(2));
e3.af.s = 0.10;
ok('low safety hits drift rule', e3.guard().includes('RETREAT_MARKER'), 's=' + e3.af.s.toFixed(2));

const prof3 = clone(DEFAULT_PROFILE);
prof3.persona_guard.enabled = true;
prof3.persona_guard.drift_rules = [{ when: 's > 0.90', then: 'NEVER_MARKER' }];
const e4 = createEngine('t4', { profile: prof3 });
e4.af.s = 0.50;
ok('high threshold no hit', !e4.guard().includes('NEVER_MARKER'));

console.log('== G5. inject() prepends guard, backward compatible ==');
ok('disabled: inject has no guard', !e1.inject().includes('AI cognition entity'));
const inj2 = e2.inject();
ok('enabled: inject has guard', inj2.includes('AI cognition entity'));
ok('guard before state block', inj2.indexOf('AI cognition entity') < inj2.indexOf('此刻'));

console.log('----');
console.log('GUARD PASS ' + pass + ' / FAIL ' + fail);
process.exit(fail ? 1 : 0);
