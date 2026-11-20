'use strict';
const $ = id => document.getElementById(id);
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('nq_' + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('nq_' + k, JSON.stringify(v)); } catch {} }
};

/* ---------- Difficulty: hearts always allow a perfect binary search + 2 spare ---------- */
const MAXES = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
const maxFor = l => l <= MAXES.length ? MAXES[l - 1] : MAXES.at(-1) * 2 ** (l - MAXES.length);
const optimal = max => Math.ceil(Math.log2(max + 1));
const heartsFor = max => optimal(max) + 2;

/* ---------- Achievements ---------- */
const ACH = {
  first:  ['🌱', 'First Steps', 'Clear level 1'],
  lucky:  ['🍀', 'Lucky Shot', 'Find a number on your first guess'],
  clutch: ['😅', 'Clutch', 'Clear a level with 1 heart left'],
  lvl5:   ['🚀', 'Climber', 'Reach level 5'],
  pure:   ['🧠', 'Pure Mind', 'Clear 3 levels in a row without hints'],
  big:    ['💎', 'High Roller', 'Score 2000 in one run'],
  speed:  ['⚡', 'Speed Demon', 'Clear a timed level with 10+ seconds left'],
  boss:   ['👹', 'Boss Slayer', 'Defeat a boss level'],
  daily:  ['📅', 'Daily Driver', 'Complete a Daily Challenge'],
  sharp:  ['🎯', 'Sharp Mind', 'Clear 3 levels in a row with optimal guesses'],
  streak5:['🔥', 'On Fire', 'Reach a 5-level optimal streak'],
  lvl10:  ['🏔️', 'Summit', 'Clear level 10 in any mode'],
  surv:   ['🛡️', 'Survivor', 'Clear level 8 in Survival'],
  rush10: ['🏃', 'Rush Hour', 'Clear 10 levels in one Rush run'],
  rich:   ['🪙', 'Coin Hoarder', 'Hold 500 coins'],
  shopper:['🛍️', 'Shopper', 'Buy a theme'],
  vet:    ['🎖️', 'Veteran', 'Finish 10 games'],
  mission:['📋', 'Mission Done', 'Claim a daily mission reward'],
  season: ['🍂', 'Seasonal Spirit', 'Equip a limited-time seasonal theme']
};
let unlocked = store.get('ach', {});
function unlock(id) {
  if (unlocked[id]) return;
  unlocked[id] = true; store.set('ach', unlocked);
  sfx.ach(); toast(`${ACH[id][0]} ${ACH[id][1]} unlocked!`);
}
function renderAch() {
  $('achList').replaceChildren(...Object.entries(ACH).map(([id, [ic, nm, ds]]) => {
    const li = document.createElement('li'), s = document.createElement('small');
    li.textContent = `${ic} ${nm}`; s.textContent = ds;
    if (!unlocked[id]) li.className = 'locked';
    li.append(s); return li;
  }));
}
let toastTimer;
function toast(t) {
  const el = $('toast'); el.textContent = t; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ---------- Sound (Web Audio, no files needed) ---------- */
let ctx, muted = store.get('muted', false);
function tone(f, d = .12, type = 'sine', at = 0, v = .15) {
  if (muted) return;
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + at;
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + d);
  } catch {}
}
const seq = (fs, d, type) => fs.forEach((f, i) => tone(f, d, type, i * .1));
const vib = p => { if (store.get('vib', true)) navigator.vibrate?.(p); };
const sfx = {
  ok: () => { vib([40, 30, 80]); seq([523, 659, 784, 1047], .18, 'triangle'); },
  bad: () => { vib(60); tone(170, .2, 'sawtooth'); },
  warn: () => tone(330, .08, 'square'),
  hint: () => seq([600, 800], .1),
  boss: () => seq([196, 196, 233, 196, 261, 233], .22, 'sawtooth'),
  bossWin: () => seq([523, 659, 784, 1047, 1319, 1568], .2, 'triangle'),
  lose: () => seq([300, 220, 150], .3, 'square'),
  ach: () => seq([784, 988, 1319], .15, 'triangle')
};
let musicTimer = 0;                       // soft generative ambient pad, no audio files
const SCALE = [220, 246.9, 277.2, 329.6, 370, 440, 493.9];
function musicTick() {
  if (muted || document.hidden || !store.get('music', true)) return;
  const f = SCALE[Math.floor(Math.random() * SCALE.length)];
  tone(f, 2.6, 'sine', 0, .035);
  if (Math.random() < .5) tone(f * 1.5, 2.6, 'triangle', .4, .02);
  if (Math.random() < .3) tone(f / 2, 3.2, 'sine', 0, .03);
}
const startMusic = () => { if (!musicTimer) musicTimer = setInterval(musicTick, 1800); };
function renderMute() { $('mute').textContent = muted ? '🔇' : '🔊'; }

/* ---------- Effects ---------- */
function burst() {
  const fx = $('fx');
  for (let i = 0; i < 18; i++) {
    const s = document.createElement('span'), a = Math.random() * 6.28, r = 80 + Math.random() * 160;
    s.textContent = ['✨', '⭐', '🎉', '💫'][i % 4];
    s.style.setProperty('--x', Math.cos(a) * r + 'px'); s.style.setProperty('--y', Math.sin(a) * r + 'px');
    fx.append(s); setTimeout(() => s.remove(), 950);
  }
}
function shake() { const f = $('form'); f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); }
function pulse(id) { const e = $(id); e.classList.remove('pulse'); void e.offsetWidth; e.classList.add('pulse'); }

/* ---------- Game state ---------- */
let s = null, timer = 0, tick = 0, mode = store.get('mode', 'classic'), shareText = '';
const BOSS = { id: 'boss', ic: '👹', name: 'Boss', d: 'timed · ×3 points · bonus box' };
const THEMES = { violet: ['Violet', 260, 0], ocean: ['Ocean', 195, 40], sunset: ['Sunset', 15, 60], forest: ['Forest', 135, 60],
  winter: ['Winter', 200, 80], sakura: ['Blossom', 330, 80], summer: ['Summer', 45, 80], autumn: ['Autumn', 25, 80] };
const SEASONAL = new Set(['winter', 'sakura', 'summer', 'autumn']), FALL = { winter: '❄️', sakura: '🌸', summer: '☀️', autumn: '🍂' };
const season = () => ['winter', 'winter', 'sakura', 'sakura', 'sakura', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'][new Date().getMonth()];
const POW = { half: ['✂️', '50/50', 30], heart: ['❤️', 'Extra heart', 40], digit: ['🔢', 'Last digit', 25] };
const MISSIONS = [['Clear 5 levels', 5], ['Solve 2 levels in the fewest guesses', 2], ['Play today’s Daily Challenge', 1], ['Play 3 games', 3], ['Clear 3 levels without hints', 3]];
const DAILY_LEVELS = 6, dayKey = (o = 0) => { const d = new Date(); d.setDate(d.getDate() - o); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }, today = () => dayKey();
const num = (k, d) => store.get(k, d), theme = () => THEMES[store.get('theme', 'violet')] || THEMES.violet;
const addCoins = n => store.set('coins', num('coins', 0) + n);
const inv = () => store.get('inv', { half: 2, heart: 1, digit: 2 });
const h = (tag, text, cls) => { const e = document.createElement(tag); e.textContent = text; if (cls) e.className = cls; return e; };
function seedRng(str) {            // same date → same sequence for every player
  let x = 1779033703;
  for (const c of str) { x = Math.imul(x ^ c.charCodeAt(0), 3432918353); x = x << 13 | x >>> 19; }
  let a = x;
  return () => { a = a + 1831565813 | 0; let q = Math.imul(a ^ a >>> 15, 1 | a); q = q + Math.imul(q ^ q >>> 7, 61 | q) ^ q; return ((q ^ q >>> 14) >>> 0) / 4294967296; };
}
function mission(i, n = 1) { const m = missions(); m.p[i] = Math.min(MISSIONS[i][1], m.p[i] + n); store.set('mis', m); }
function missions() { const m = store.get('mis', null); return m && m.d === today() && m.p.length === MISSIONS.length ? m : { d: today(), p: MISSIONS.map(() => 0), c: MISSIONS.map(() => 0) }; }
const TWISTS = [
  { id: 'gold', ic: '💰', name: 'Double Points', d: 'this level scores ×2' },
  { id: 'heal', ic: '💖', name: 'Second Wind', d: '+2 hearts' },
  { id: 'fog',  ic: '🌫️', name: 'Fog', d: 'the range is hidden' },
  { id: 'rush', ic: '⚡', name: 'Rush', d: 'beat the clock!' }
];
const rnd = (a, b) => Math.floor((s?.rng ? s.rng() : Math.random()) * (b - a + 1)) + a;

function startRun(daily = false, saved = null) {
  const ch = typeof daily === 'string' && daily[0] === 'c';   // 'c:<seed>' = friend challenge
  clearTimeout(timer); clearInterval(tick);
  s = saved || { level: 1, score: 0, hintsLeft: 2, pure: 0, streak: 0, usedHint: false, adj: 0, cleared: 0, gsum: 0, bestStreak: 0, earned: 0,
    t0: Date.now(), daily, mode: daily === 'rush' ? 'rush' : daily ? 'classic' : mode, seed: ch ? daily.slice(2) : '', diff: daily ? 'normal' : store.get('diff', 'normal'), rng: daily ? seedRng(ch ? 'nqc' + daily.slice(2) : (daily === 'rush' ? 'nqr' : 'nq') + today()) : null };
  $('menu').hidden = true; $('game').hidden = false; if (!saved) mission(3);
  if (daily && !ch) { mission(2); const d = store.get('dly', {}), r = daily === 'rush'; d[r ? 'rdone' : 'done'] = today(); d[r ? 'rscore' : 'score'] = 0; store.set('dly', d); }
  saved ? resume() : newLevel();
}
function resume() {
  s.busy = false; if (s.next) return newLevel();
  s.tried = new Set(s.tried); s.twist = s.twist === 'boss' ? BOSS : TWISTS.find(x => x.id === s.twist) || null;
  s.deadline = Date.now() + (s.rem || 0) * 1000; if (s.mode === 'rush') s.gdl = s.deadline;
  paint(); setMsg('Welcome back! Your run was restored.', '');
}
function newLevel() {
  const prevH = s.hearts; s.next = false;
  s.max = maxFor(s.mode === 'survival' ? Math.ceil(s.level / 2) : s.mode === 'rush' ? Math.min(s.level, 7) : s.level); s.secret = rnd(0, s.max);
  const adj = s.adj; s.adj = 0;               // adaptive difficulty from last level
  const base = heartsFor(s.max) + adj + { easy: 2, normal: 0, hard: -2 }[s.diff];
  s.hearts = Math.max(optimal(s.max) + (s.diff === 'hard' ? 0 : 1), base);
  s.twist = s.level % 5 === 0 ? BOSS : s.level >= 2 && rnd(0, 1) ? TWISTS[rnd(0, TWISTS.length - 1)] : null;
  if (s.mode === 'rush') s.twist = null;
  const t = s.twist?.id;
  if (t === 'heal') s.hearts += 2;
  if (s.mode === 'survival') s.hearts = (s.level === 1 ? 6 : Math.min(12, prevH + 1 + (s.streak > 0 ? 1 : 0))) + (t === 'heal' ? 2 : 0);
  if (s.mode === 'rush') s.hearts = optimal(s.max) + 4;
  s.limit = s.mode === 'blitz' || t === 'rush' || t === 'boss' ? 15 + optimal(s.max) * (t === 'rush' || t === 'boss' ? 3 : 5) : 0;
  s.deadline = Date.now() + s.limit * 1000;
  if (s.mode === 'rush') { s.limit = 60; s.gdl ??= Date.now() + 60000; s.deadline = s.gdl; }
  s.lo = 0; s.hi = s.max; s.tried = new Set(); s.hist = []; s.guesses = 0; s.usedHint = false; s.busy = false;
  paint();
  if (s.twist?.id === 'boss') sfx.boss();
  setMsg(`${s.daily ? (s.seed ? `🤝 Challenge ${s.level}/${DAILY_LEVELS}` : s.mode === 'rush' ? `🔥 Daily Rush ${s.level}` : `📅 Daily ${s.level}/${DAILY_LEVELS}`) : `Level ${s.level}`}: ${s.hearts} hearts.${adj > 0 ? ' Extra heart on the house!' : adj < 0 ? ' You’re on fire, so fewer hearts!' : ''}`, '');
  save();
}
function paint() {
  document.documentElement.style.setProperty('--h', (theme()[1] + s.level * 25) % 360);
  const tw = $('twist'); tw.hidden = !s.twist;
  if (s.twist) tw.textContent = `${s.twist.ic} ${s.twist.name}: ${s.twist.d}`;
  startClock(); $('guess').value = ''; render(); $('guess').focus();
}
function save() {
  if (!s || s.daily || s.busy) return;
  store.set('save', { ...s, rng: null, tried: [...s.tried], twist: s.twist?.id || null, rem: s.limit ? Math.max(1, (s.deadline - Date.now()) / 1000) : 0 });
}
function setMsg(t, c) { const m = $('msg'); m.textContent = t; m.className = 'msg ' + c; }
function render() {
  $('level').textContent = s.level; $('score').textContent = s.score;
  $('hearts').textContent = '❤️ ' + s.hearts; $('max').textContent = s.max;
  $('guess').max = s.max;
  const w = $('win');
  w.style.left = (s.lo / (s.max + 1)) * 100 + '%';
  w.style.width = ((s.hi - s.lo + 1) / (s.max + 1)) * 100 + '%';
  const fog = s.twist?.id === 'fog';
  $('known').textContent = fog ? '🌫️ Fog hides the range!' : `It's between ${s.lo} and ${s.hi}`;
  w.parentElement.style.opacity = fog ? .15 : 1;
  const lock = s.busy || s.daily || s.twist?.id === 'boss', iv = inv();
  $('hint').textContent = `💡 Hint (${s.hintsLeft})`; $('hint').disabled = s.hintsLeft < 1 || lock;
  for (const [k, id] of [['half', 'pHalf'], ['heart', 'pHeart'], ['digit', 'pDigit']]) {
    $(id).textContent = `${POW[k][0]} ${POW[k][1]} (${iv[k]})`;
    $(id).disabled = iv[k] < 1 || s.busy || s.daily || (k === 'digit' && s.max < 25);
  }
  $('go').disabled = s.busy;
  $('chips').replaceChildren(...s.hist.map(h => {
    const li = document.createElement('li');
    li.className = h.dir; li.textContent = `${h.g} ${h.dir === 'lo' ? '↑' : '↓'}`; return li;
  }));
}
function heat(g) {
  const r = Math.abs(g - s.secret) / s.max;
  return r <= .03 ? '🔥 Burning!' : r <= .1 ? '♨️ Hot' : r <= .25 ? '🙂 Warm' : '❄️ Cold';
}

function guess(e) {
  e.preventDefault();
  if (!s || s.busy) return;
  const raw = $('guess').value.trim(), g = Number(raw);
  if (raw === '' || !Number.isInteger(g) || g < 0 || g > s.max)
    return reject(`Enter a whole number from 0 to ${s.max}.`);
  if (s.tried.has(g)) return reject('Already tried that — no heart lost.');
  if (s.twist?.id !== 'fog' && (g < s.lo || g > s.hi)) return reject(`You already know it's between ${s.lo} and ${s.hi} — no heart lost.`);
  s.tried.add(g); s.guesses++;
  $('guess').value = ''; $('guess').focus();
  if (g === s.secret) return win();
  s.hearts--; pulse('hearts');
  const lo = g < s.secret;
  lo ? s.lo = Math.max(s.lo, g + 1) : s.hi = Math.min(s.hi, g - 1);
  s.hist.push({ g, dir: lo ? 'lo' : 'hi' });
  setMsg(`${lo ? 'Too low ↑' : 'Too high ↓'}  ${heat(g)}`, 'bad');
  shake(); sfx.bad();
  if (Math.abs(g - s.secret) / s.max <= .02) { s.score += 10; toast('🎯 Near miss! +10'); }
  s.hearts <= 0 ? lose() : (render(), save());
}
function reject(t) { setMsg(t, 'warn'); shake(); sfx.warn(); $('guess').select(); }

function win() {
  s.busy = true; clearInterval(tick); store.set('save', null);
  const opt = optimal(s.max), tw = s.twist?.id;
  s.streak = s.guesses <= opt ? s.streak + 1 : 0; s.bestStreak = Math.max(s.bestStreak, s.streak);
  const tl = s.limit ? Math.max(0, Math.ceil((s.deadline - Date.now()) / 1000)) : 0;
  const mult = (tw === 'gold' ? 2 : tw === 'boss' ? 3 : 1) * { easy: .8, normal: 1, hard: 1.5 }[s.diff];
  const gain = Math.round((100 * s.level + s.hearts * 25 + s.streak * 50 + tl * 5) * mult);
  s.score += gain; s.cleared++; s.gsum += s.guesses;
  { const b4 = lvOf(num('xp', 0)); store.set('xp', num('xp', 0) + gain); if (lvOf(num('xp', 0)) > b4) setTimeout(() => toast(`⭐ Rank up! ${rk()}`), 900); }
  const c = 5 + s.level + (tw === 'boss' ? 25 : 0); s.earned += c; addCoins(c);
  s.pure = s.usedHint ? 0 : s.pure + 1;
  mission(0); if (s.guesses <= opt) mission(1);
  if (s.level === 1) unlock('first');
  if (s.guesses === 1) unlock('lucky');
  if (s.hearts === 1) unlock('clutch');
  if (s.level + 1 >= 5) unlock('lvl5');
  if (s.pure >= 3) unlock('pure');
  if (s.score >= 2000) unlock('big');
  if (tl >= 10) unlock('speed');
  if (tw === 'boss') unlock('boss');
  if (s.streak >= 3) unlock('sharp'); if (s.streak >= 5) unlock('streak5'); if (s.level >= 10) unlock('lvl10');
  if (s.mode === 'survival' && s.level >= 8) unlock('surv'); if (s.mode === 'rush' && s.cleared >= 10) unlock('rush10'); if (num('coins', 0) >= 500) unlock('rich');
  if (!s.usedHint) mission(4);
  s.adj = s.hearts <= 1 ? 1 : s.guesses <= opt ? -1 : 0;
  tw === 'boss' ? sfx.bossWin() : sfx.ok(); burst(); pulse('score');
  const extra = tw === 'boss' || s.level % 3 === 0 ? ' ' + box() : '';
  setMsg(`🎉 ${s.secret}! +${gain} · 🪙${c}${s.streak > 1 ? ` · streak ×${s.streak}` : ''}${extra}`, 'good');
  s.level++; if (s.mode === 'rush') s.gdl += 7000; render();
  if (!s.daily) { s.next = true; s.busy = false; save(); s.busy = true; }   // keep progress during the level-up pause
  timer = setTimeout(s.daily && s.mode !== 'rush' && s.level > DAILY_LEVELS ? () => finish(true) : newLevel, 1400);
}
function box() {                      // mystery box (not in the Daily, which must stay identical for everyone)
  if (s.daily) return '';
  if (Math.random() < .5) { const n = rnd(10, 40); addCoins(n); s.earned += n; return `🎁 +${n} 🪙`; }
  const k = Object.keys(POW)[rnd(0, 2)], iv = inv(); iv[k]++; store.set('inv', iv); return `🎁 ${POW[k][0]} ${POW[k][1]}!`;
}
function lose() { finish(false); }
const fmt = t => t >= 3600 ? `${Math.floor(t / 3600)}h ${Math.floor(t % 3600 / 60)}m` : `${Math.floor(t / 60)}m ${t % 60}s`;
function finish(won) {
  if (s.over) return;
  s.over = s.busy = true; clearInterval(tick); store.set('save', null);
  if (won) { sfx.ok(); burst(); } else { render(); sfx.lose(); setMsg(`The number was ${s.secret}.`, 'bad'); }
  const secs = Math.round((Date.now() - s.t0) / 1000), reached = won ? s.level - 1 : s.level, st = store.get('stats', {});
  st.games = (st.games || 0) + 1; st.cleared = (st.cleared || 0) + s.cleared; st.gsum = (st.gsum || 0) + s.gsum; st.secs = (st.secs || 0) + secs;
  st.bestLevel = Math.max(st.bestLevel || 0, reached); st.bestStreak = Math.max(st.bestStreak || 0, s.bestStreak); store.set('stats', st); if (st.games >= 10) unlock('vet');
  const best = store.get('best', 0), isBest = !s.daily && s.score > best;
  if (isBest) store.set('best', s.score);
  if (s.daily && !s.seed) { const d = store.get('dly', {}); d[s.mode === 'rush' ? 'rscore' : 'score'] = s.score; store.set('dly', d); if (s.mode === 'rush') { const c = s.cleared * 3; addCoins(c); s.earned += c; } if (won) { unlock('daily'); addCoins(50); s.earned += 50; } }
  if (s.score > 0) {
    const b = store.get('board', []);
    b.push({ n: ($('name').value.trim() || 'Player').slice(0, 12), s: s.score, l: reached, m: s.seed ? 'duel' : s.daily ? 'daily' : s.mode });
    b.sort((x, y) => y.s - x.s); store.set('board', b.slice(0, 10));
  }
  const avg = s.cleared ? (s.gsum / s.cleared).toFixed(1) : '–';
  $('overTitle').textContent = won ? '📅 Daily complete!' : isBest && s.score > 0 ? '🏆 New best!' : s.daily ? '📅 Daily over' : 'Game over';
  $('overText').textContent = [`Score ${s.score}${isBest ? ' (personal record!)' : ''}`, `Level reached ${reached} · Cleared ${s.cleared}`,
    `Avg guesses/level ${avg} · Best streak ${s.bestStreak}`, `Time ${fmt(secs)} · Coins earned 🪙 ${s.earned}`].join('\n');
  shareText = `Number Quest${s.seed ? ' 🤝 Challenge' : s.daily ? ' 📅 ' + today() : ''}\nScore ${s.score} · Level ${reached} · Best streak ${s.bestStreak}\n${s.seed ? 'Same numbers, beat my score: ' : ''}${location.href.split('#')[0]}${s.seed ? '#c=' + s.seed : ''}`;
  timer = setTimeout(() => $('over').showModal(), 900);
}
function hint() {
  if (!s || s.busy || s.daily || s.twist?.id === 'boss' || s.hintsLeft < 1) return;
  s.hintsLeft--; s.usedHint = true; sfx.hint();
  setMsg(`💡 The number is ${s.secret % 2 ? 'odd' : 'even'}.`, 'warn'); render();
}
function power(k) {
  const iv = inv();
  if (!s || s.busy || s.daily || iv[k] < 1 || (k === 'digit' && s.max < 25)) return;
  iv[k]--; store.set('inv', iv); sfx.hint();
  if (k === 'half') { const m = (s.lo + s.hi) >> 1; s.secret <= m ? s.hi = m : s.lo = m + 1; s.usedHint = true; setMsg('✂️ Half of the remaining numbers removed!', 'warn'); }
  if (k === 'heart') { s.hearts++; pulse('hearts'); setMsg('❤️ +1 heart!', 'warn'); }
  if (k === 'digit') { s.usedHint = true; setMsg(`🔢 The number ends in ${s.secret % 10}.`, 'warn'); }
  render(); save();
}
function startClock() {
  clearInterval(tick);
  $('clock').hidden = !s.limit;
  if (!s.limit) return;
  $('clockbar').style.width = '100%';
  tick = setInterval(() => {
    if (!s || s.busy || document.hidden) return;
    const left = (s.deadline - Date.now()) / 1000;
    $('clockbar').style.width = Math.min(100, Math.max(0, left / s.limit * 100)) + '%';
    if (left <= 5 && left > 0 && Math.ceil(left) !== s.beep) { s.beep = Math.ceil(left); sfx.warn(); }
    if (left > 0) return;
    if (s.mode === 'rush') return lose();
    s.hearts--; pulse('hearts'); sfx.bad(); shake();
    setMsg("⏰ Time's up! −1 heart", 'bad');
    if (s.hearts <= 0) return lose();
    s.deadline = Date.now() + s.limit * 1000; render();
  }, 200);
}

/* ---------- Panels: stats, missions, shop ---------- */
function panel(title, nodes) { $('pTitle').textContent = title; $('pBody').replaceChildren(...nodes); if (!$('panel').open) $('panel').showModal(); }
function row(label, extra) { const r = h('div', label, 'stat'); r.append(extra); return r; }
function openStats() {
  const st = store.get('stats', {}), d = store.get('dly', {});
  panel('📊 Your stats', [['Games played', st.games || 0], ['Best score', store.get('best', 0)], ['Best level', st.bestLevel || 0], ['Levels cleared', st.cleared || 0],
    ['Avg guesses / level', st.cleared ? (st.gsum / st.cleared).toFixed(1) : '–'], ['Best streak', st.bestStreak || 0], ['Time played', fmt(st.secs || 0)],
    ['Daily login streak', `🔥 ${d.streak || 0}`]].map(([a, b]) => row(a, h('b', b))));
}
function openMissions() {
  const m = missions(); store.set('mis', m);
  panel('📋 Daily missions', MISSIONS.map(([text, n], i) => {
    const b = h('button', m.c[i] ? '✔' : 'Claim 🪙30', 'btn'); b.disabled = m.c[i] || m.p[i] < n;
    b.onclick = () => { m.c[i] = 1; store.set('mis', m); addCoins(30); unlock('mission'); sfx.ach(); renderMenu(); openMissions(); };
    return row(`${text} (${m.p[i]}/${n})`, b);
  }));
}
function openShop() {
  const owned = store.get('owned', ['violet']), coins = num('coins', 0), iv = inv(), rows = [h('p', `🪙 ${coins}`, 'tag')];
  for (const [id, [nm, , price]] of Object.entries(THEMES)) {
    if (SEASONAL.has(id) && id !== season() && !owned.includes(id)) continue;   // limited-time: only in season (or if owned)
    const has = owned.includes(id), on = store.get('theme', 'violet') === id;
    const b = h('button', on ? 'Equipped' : has ? 'Equip' : `🪙 ${price}`, 'btn'); b.disabled = on || (!has && coins < price);
    b.onclick = () => { if (!has) { addCoins(-price); owned.push(id); store.set('owned', owned); unlock('shopper'); } store.set('theme', id); if (SEASONAL.has(id)) unlock('season'); applyTheme(); renderMenu(); openShop(); };
    rows.push(row(`🎨 ${nm}${SEASONAL.has(id) ? ' 🕒 limited' : ''}`, b));
  }
  for (const [k, [ic, nm, price]] of Object.entries(POW)) {
    const b = h('button', `🪙 ${price}`, 'btn'); b.disabled = coins < price;
    b.onclick = () => { addCoins(-price); iv[k]++; store.set('inv', iv); renderMenu(); openShop(); };
    rows.push(row(`${ic} ${nm} (have ${iv[k]})`, b));
  }
  panel('🛍️ Shop', rows);
}

/* ---------- Menu & wiring ---------- */
const applyTheme = () => document.documentElement.style.setProperty('--h', theme()[1]);
const lvOf = xp => Math.floor(Math.sqrt(xp / 150)) + 1, RANKS = ['Rookie', 'Guesser', 'Detective', 'Analyst', 'Strategist', 'Oracle', 'Legend'];
const rk = () => { const l = lvOf(num('xp', 0)); return `${RANKS[Math.min(RANKS.length - 1, (l - 1) >> 1)]} · Lv ${l}`; };
function renderMenu() {
  const d = store.get('dly', {}), done = d.done === today();
  $('coins').textContent = num('coins', 0);
  $('streakTxt').textContent = rk() + (d.streak ? ` · 🔥 ${d.streak}-day streak` : '');
  $('daily').textContent = done ? `✅ Daily done: ${d.score}` : '📅 Daily Challenge'; $('daily').disabled = done;
  const rd = d.rdone === today(); $('drush').textContent = rd ? `✅ Rush: ${d.rscore}` : '🔥 Daily Rush'; $('drush').disabled = rd;
  $('cont').hidden = !store.get('save', null);
  renderBoard();
}
function toMenu() {
  clearTimeout(timer); clearInterval(tick); s = null;
  $('game').hidden = true; $('menu').hidden = false; applyTheme(); renderMenu();
}
function renderBoard() {
  const b = store.get('board', []);
  $('board').replaceChildren(...(b.length ? b : [null]).map((e, i) => {
    const li = document.createElement('li');
    if (!e) { li.textContent = 'No scores yet — be the first!'; return li; }
    const a = document.createElement('span'), c = document.createElement('b');
    a.textContent = `${['🥇', '🥈', '🥉'][i] || i + 1 + '.'} ${{ blitz: '⚡ ', daily: '📅 ', survival: '🛡️ ', rush: '🔥 ', duel: '🤝 ' }[e.m] || ''}${e.n} (Lv ${e.l})`; c.textContent = e.s;
    li.append(a, c); return li;
  }));
}
(function login() {                       // daily login bonus + streak
  const d = store.get('dly', {}), t = today();
  if (d.login === t) return;
  d.streak = d.login === dayKey(1) ? (d.streak || 0) + 1 : 1; d.login = t;
  const b = 10 * Math.min(d.streak, 7); store.set('dly', d); addCoins(b);
  setTimeout(() => toast(`🔥 Day ${d.streak} login bonus: +${b} 🪙`), 600);
})();
$('name').value = store.get('name', '');
$('name').addEventListener('change', () => store.set('name', $('name').value.trim()));
$('start').onclick = () => { store.set('name', $('name').value.trim());
  const sv = store.get('save', null);            // bank an abandoned run before replacing it
  if (sv && sv.score > 0) { const b = store.get('board', []); b.push({ n: ($('name').value.trim() || 'Player').slice(0, 12), s: sv.score, l: sv.level, m: sv.mode }); b.sort((x, y) => y.s - x.s); store.set('board', b.slice(0, 10)); if (sv.score > store.get('best', 0)) store.set('best', sv.score); }
  store.set('save', null); tone(440, .05); startRun(); };
$('cont').onclick = () => { tone(440, .05); startRun(false, store.get('save', null)); };
$('daily').onclick = () => { tone(440, .05); startRun(true); };
$('chal').onclick = () => { tone(440, .05); startRun('c:' + Math.random().toString(36).slice(2, 8)); };
$('drush').onclick = () => { tone(440, .05); startRun('rush'); };
$('diff').value = store.get('diff', 'normal'); $('diff').onchange = () => store.set('diff', $('diff').value);
$('missions').onclick = openMissions; $('shop').onclick = openShop; $('stats').onclick = openStats;
$('closeP').onclick = () => { $('panel').close(); renderMenu(); };
$('form').addEventListener('submit', guess);
$('hint').onclick = hint;
$('pHalf').onclick = () => power('half'); $('pHeart').onclick = () => power('heart'); $('pDigit').onclick = () => power('digit');
$('quit').onclick = () => s?.daily && !s.over ? (confirm('Quit the Daily Challenge? It will count as played today.') && finish(false)) : toMenu();
$('again').onclick = () => { $('over').close(); startRun(); };
$('toMenu').onclick = () => { $('over').close(); toMenu(); };
$('share').onclick = async () => {
  try { navigator.share ? await navigator.share({ text: shareText }) : (await navigator.clipboard.writeText(shareText), toast('Result copied!')); } catch {}
};
$('showAch').onclick = () => { renderAch(); $('ach').showModal(); };
$('closeAch').onclick = () => $('ach').close();
$('mute').onclick = () => { muted = !muted; store.set('muted', muted); renderMute(); tone(520, .08); };
const MODES = { classic: 'Relaxed, no clock. Random twists and boss levels keep it fresh.', blitz: 'Beat the clock each level. Fast wins earn bonus points.',
  survival: 'One heart pool for the whole run: hearts carry over, +1 per clear (+2 for a perfect solve). How deep can you go?', rush: 'One 60-second clock for the whole run. Every clear adds time. Chain as many levels as you can!' };
function renderMode() {
  document.querySelectorAll('.mode').forEach(b => b.classList.toggle('sel', b.dataset.m === mode));
  $('modeDesc').textContent = MODES[mode];
}
document.querySelectorAll('.mode').forEach(b => b.onclick = () => { mode = b.dataset.m; store.set('mode', mode); renderMode(); tone(480, .05); });
$('over').addEventListener('cancel', e => e.preventDefault());   // Esc must not strand the game screen
document.addEventListener('visibilitychange', () => {   // pause timed levels while the tab is hidden
  if (!s || !s.limit || s.busy) return;
  if (document.hidden) s.pauseRem = s.deadline - Date.now();
  else if (s.pauseRem != null) { s.deadline = Date.now() + s.pauseRem; if (s.mode === 'rush') s.gdl = s.deadline; s.pauseRem = null; }
});
const applyAnim = () => document.body.classList.toggle('noanim', !store.get('anim', true));
function openHow() {
  panel('❓ How to play', ['Guess the secret number. You’re told whether you were too low or too high.', 'Every wrong guess costs a heart. Lose them all and the run ends.', 'Guessing the middle of the range always works: each level gives you just enough hearts.', 'Perfect solves build a streak for bonus points. Earn 🪙 to buy themes and power-ups.', 'Try Survival, Rush, and the Daily Challenge and Daily Rush: everyone gets the same numbers each day!'].map(t => h('p', t)));
}
function openSettings() {
  const tg = (label, on, fn) => { const b = h('button', on ? 'On' : 'Off', 'btn'); b.onclick = () => { fn(); openSettings(); }; return row(label, b); };
  const hb = h('button', 'Open', 'btn'); hb.onclick = openHow;
  const rs = h('button', 'Reset', 'btn');
  rs.onclick = () => { if (confirm('Erase ALL progress, coins, stats and settings on this device? This cannot be undone.')) { Object.keys(localStorage).filter(k => k.startsWith('nq_')).forEach(k => localStorage.removeItem(k)); location.reload(); } };
  panel('⚙️ Settings', [tg('🔊 Sound', !muted, () => { muted = !muted; store.set('muted', muted); renderMute(); }),
    tg('📳 Vibration', store.get('vib', true), () => store.set('vib', !store.get('vib', true))),
    tg('🎵 Music', store.get('music', true), () => store.set('music', !store.get('music', true))),
    tg('✨ Animated background', store.get('anim', true), () => { store.set('anim', !store.get('anim', true)); applyAnim(); }),
    row('❓ How to play', hb), row('🗑️ Erase all data', rs), h('p', 'Number Quest v3 · progress is stored on this device only', 'tag')]);
}
$('settings').onclick = openSettings; applyAnim();
{ const m = /^#c=([a-z0-9]{4,8})$/i.exec(location.hash);   // incoming friend challenge
  if (m) {
    history.replaceState(null, '', location.pathname + location.search); store.set('seen', true);
    const b = h('button', '⚔️ Accept challenge', 'btn primary'); b.onclick = () => { $('panel').close(); startRun('c:' + m[1].toLowerCase()); };
    setTimeout(() => panel('🤝 Challenge!', [h('p', 'A friend sent you a seeded run: the same 6 levels for both of you. No hints, no power-ups. Can you beat their score?'), b]), 700);
  } }
if (!store.get('seen', false)) { store.set('seen', true); setTimeout(openHow, 500); }
document.addEventListener('pointerdown', startMusic, { once: true });
setInterval(() => {                       // seasonal particles behind the UI
  const e = FALL[store.get('theme', 'violet')];
  if (!e || document.hidden || !store.get('anim', true) || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const sp = document.createElement('span');
  sp.textContent = e; sp.style.cssText = `left:${Math.random() * 100}%;font-size:${14 + Math.random() * 16}px;animation-duration:${7 + Math.random() * 6}s`;
  $('bg').append(sp); setTimeout(() => sp.remove(), 14000);
}, 1100);
{ const k = season() + new Date().getFullYear();
  if (store.get('sseen', '') !== k) { store.set('sseen', k); setTimeout(() => toast(`${FALL[season()]} A limited-time seasonal theme is in the Shop!`), 2800); } }
applyTheme(); renderMode(); renderMute(); renderMenu();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
