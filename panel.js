/**
 * HypeVox — Popup Controller
 * MIT License — github.com/sahinguclu/HypeVox
 */

// Volume steps: 0→50→100(default)→150→200→300→500→750→1000
const STEPS = (() => {
  const s = [];
  for (let v = 0; v <= 50; v += 10) s.push(v);
  for (let v = 60; v <= 100; v += 10) s.push(v);
  for (let v = 110; v <= 200; v += 10) s.push(v);
  for (let v = 220; v <= 500; v += 20) s.push(v);
  for (let v = 525; v <= 750; v += 25) s.push(v);
  for (let v = 800; v <= 1000; v += 50) s.push(v);
  return s;
})();

const VOL_DEF = 100;

const PRESETS = {
  off:       [ 0, 0, 0, 0, 0, 0, 0, 0],
  bass:      [ 8, 6, 3, 0,-1,-2,-1, 0],
  voice:     [-2,-1, 0, 3, 6, 5, 2, 0],
  treble:    [ 0, 0,-1, 0, 2, 4, 6, 8],
  loud:      [ 5, 3, 1, 3, 4, 3, 2, 1],
  podcast:   [-3,-2, 0, 4, 6, 5, 3, 0],
  rock:      [ 2, 1,-2, 3, 5, 3, 1, 2],
  pop:       [ 1, 2, 3,-1,-2, 1, 4, 5],
  jazz:      [ 3, 2, 1,-2, 2, 3, 4, 3],
  hiphop:    [ 7, 5, 2, 0, 1, 2, 3, 4],
  classical: [ 2, 1, 0, 0, 1, 2, 3, 4],
  electronic:[ 6, 3,-2, 2, 4, 2, 5, 7],
};

// ── DOM ──────────────────────────────────────────────────
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const D = {
  dark: $('#btnDark'), close: $('#btnClose'), langBtn: $('#btnLang'),
  langDrop: $('#langDrop'), langSelect: $('#langSelect'),
  slider: $('#volSlider'), num: $('#volNum'), tag: $('#volTag'),
  vBtns: $$('.vbtn'),
  eqSelect: $('#eqSelect'),
  reset: $('#btnReset'),
  tTitle: $('#tabsTitle'), tList: $('#tabsList'), tTpl: $('#tplTab'),
  // Translatable labels
  lblMute: $('#lblMute'), lblMax: $('#lblMax'), lblSound: $('#lblSoundProfile'),
  lblMade: $('#lblMadeBy'), lblWith: $('#lblWith'), lblSource: $('#lblSource'),
};

// ── Helpers ──────────────────────────────────────────────
let tab = null, dark = false, wheelT = 0;
let curLang = 'en';

function nearest(v) { return STEPS.reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a); }
function idxOf(v) { return STEPS.indexOf(nearest(v)); }

function svc(msg) { return chrome.runtime.sendMessage({ ...msg, target: 'background' }); }

async function load(key, fb) { const r = await chrome.storage.local.get({ [key]: JSON.stringify(fb) }); return JSON.parse(r[key]); }
async function save(key, v) { await chrome.storage.local.set({ [key]: JSON.stringify(v) }); }

// ── Volume ───────────────────────────────────────────────
function uiVol(v) {
  D.num.textContent = v;
  D.tag.textContent = v === 0 ? T('muted') : v === VOL_DEF ? T('default') : v < VOL_DEF ? `▼ ${v}%` : `▲ ${v}%`;
  D.reset.classList.toggle('hidden', v === VOL_DEF);
  highlightPreset(v);
}

function setVol(v) {
  const cv = nearest(Math.max(0, Math.min(1000, v)));
  D.slider.value = idxOf(cv);
  uiVol(cv);
  D.slider.dispatchEvent(new Event('change'));
}

async function pushVol(v) {
  if (!tab) return;
  try { await svc({ action: 'setVol', tabId: tab.id, value: v }); } catch (e) { console.error(e); }
  chrome.action.setBadgeText({ text: String(v), tabId: tab.id });
}

// ── EQ Dropdown ───────────────────────────────────────────
D.eqSelect.addEventListener('change', async () => {
  const name = D.eqSelect.value;
  const gains = PRESETS[name];
  if (!gains) return;
  if (tab) await svc({ action: 'setEQ', tabId: tab.id, gains });
  await save('eq', name);
});

// ── Language Switcher ─────────────────────────────────────
function applyLang(lang) {
  curLang = lang;
  globalThis._hvLang = lang;
  D.lblMute.textContent = T('mute');
  D.lblMax.textContent = T('maxVol');
  D.lblSound.textContent = T('soundProfile');
  D.lblMade.textContent = T('madeBy');
  D.lblWith.textContent = T('withLove');
  D.lblSource.textContent = T('sourceCode');
  const keys = ['off','bass','voice','treble','loud','podcast','rock','pop','jazz','hiphop','classical','electronic'];
  const opts = D.eqSelect.options;
  for (let i = 0; i < opts.length && i < keys.length; i++) opts[i].textContent = T(keys[i]);
  D.reset.textContent = T('reset');
  const muteBtn = document.querySelector('.vbtn[data-v="0"]');
  if (muteBtn) muteBtn.textContent = T('mute');
  updateTabsTitle();
}

function updateTabsTitle() {
  D.tTitle.textContent = D.tList.children.length > 0 ? T('tabsPlaying') : T('noAudio');
}

function buildLangDropdown() {
  D.langSelect.innerHTML = '';
  const sorted = Object.entries(LANG).sort((a, b) => a[1].name.localeCompare(b[1].name));
  for (const [code, data] of sorted) {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = data.name;
    if (code === curLang) opt.selected = true;
    D.langSelect.appendChild(opt);
  }
}

D.langBtn.addEventListener('click', () => D.langDrop.classList.toggle('hidden'));
D.langSelect.addEventListener('change', async () => {
  const lang = D.langSelect.value;
  applyLang(lang);
  await save('lang', lang);
});

// ── Tabs ─────────────────────────────────────────────────
async function loadTabs() {
  const tabs = await chrome.tabs.query({ audible: true }); tabs.sort((a, b) => b.id - a.id);
  D.tList.innerHTML = '';
  for (const t of tabs) {
    const cl = D.tTpl.content.cloneNode(true), row = cl.querySelector('.trow');
    row.dataset.tabId = t.id;
    const icon = row.querySelector('.trow__icon');
    if (t.favIconUrl) { icon.src = t.favIconUrl; } else { icon.style.display = 'none'; }
    row.querySelector('.trow__name').textContent = t.title;
    D.tList.appendChild(cl);
  }
  D.tList.onclick = async (e) => {
    e.preventDefault(); const row = e.target.closest('.trow'); if (!row) return;
    const t = await chrome.tabs.update(+row.dataset.tabId, { active: true });
    chrome.windows.update(t.windowId, { focused: true });
  };
  updateTabsTitle();
}

// ── Settings ─────────────────────────────────────────────
D.dark.addEventListener('click', async () => {
  dark = !dark; document.body.classList.toggle('dark', dark); await save('theme', dark);
});
D.close.addEventListener('click', () => window.close());

// ── Volume Preset Buttons ────────────────────────────────
function highlightPreset(v) {
  D.vBtns.forEach((b) => b.classList.remove('active'));
  const match = document.querySelector(`.vbtn[data-v="${v}"]`);
  if (match) match.classList.add('active');
  else {
    // Find closest matching preset button
    const presets = [0, 50, 100, 150, 200, 300, 500, 750, 1000];
    const closest = presets.reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a);
    const btn = document.querySelector(`.vbtn[data-v="${closest}"]`);
    if (btn) btn.classList.add('active');
  }
}

D.vBtns.forEach((b) => {
  b.addEventListener('click', () => setVol(parseInt(b.dataset.v)));
});

// ── Slider ───────────────────────────────────────────────
function initSlider() {
  D.slider.max = STEPS.length - 1;
  D.slider.addEventListener('input', () => uiVol(STEPS[+D.slider.value]));
  D.slider.addEventListener('change', () => { const v = STEPS[+D.slider.value]; pushVol(v); });
  D.slider.addEventListener('wheel', (e) => {
    e.preventDefault(); if (Date.now() - wheelT < 70) return; wheelT = Date.now();
    const d = Math.sign(e.deltaY);
    let i = +D.slider.value + d; i = Math.max(0, Math.min(STEPS.length - 1, i));
    D.slider.value = i; D.slider.dispatchEvent(new Event('change'));
  }, { passive: false });
}

// ── Keyboard ─────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  const k = e.key;
  if (k === 'ArrowUp' || k === 'ArrowRight') { e.preventDefault(); D.slider.value = Math.min(+D.slider.value + 1, STEPS.length - 1); D.slider.dispatchEvent(new Event('change')); }
  if (k === 'ArrowDown' || k === 'ArrowLeft') { e.preventDefault(); D.slider.value = Math.max(+D.slider.value - 1, 0); D.slider.dispatchEvent(new Event('change')); }
  const lm = [0, 50, 100, 150, 200, 300, 500, 750, 1000]; const n = parseInt(k);
  if (!isNaN(n) && n >= 0 && n <= 8) { e.preventDefault(); setVol(lm[n]); }
});

// ── Buttons ──────────────────────────────────────────────
D.reset.addEventListener('click', () => setVol(VOL_DEF));

// ── Bootstrap ────────────────────────────────────────────
(async function main() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tabs.length) return;
  tab = tabs[0];

  // Theme
  dark = await load('theme', false);
  document.body.classList.toggle('dark', dark);

  // Language
  curLang = await load('lang', 'en');
  globalThis._hvLang = curLang;
  buildLangDropdown();
  applyLang(curLang);

  // EQ
  const savedEQ = await load('eq', 'off');
  D.eqSelect.value = savedEQ in PRESETS ? savedEQ : 'off';

  initSlider();

  await svc({ action: 'boot' });
  await new Promise((r) => setTimeout(r, 200));

  try {
    const st = await chrome.runtime.sendMessage({ action: 'getState', tabId: tab.id, target: 'offscreen' });
    if (st) setVol(st.vol);
  } catch {}

  await loadTabs();

  // Fade in after everything is ready
  document.body.classList.add('ready');
})();
