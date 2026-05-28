/**
 * HypeVox — Audio Processor
 * Runs in offscreen document. Captures tab audio and applies volume/EQ.
 * MIT License — github.com/sahinguclu/HypeVox
 */

// Per-tab audio state
const tabs = {};

// Build audio chain: source → [8-band EQ] → gain → destination
function initTab(tabId, stream) {
  const ctx = new AudioContext();
  const src = ctx.createMediaStreamSource(stream);

  const bands = [63, 125, 250, 500, 1000, 2000, 4000, 8000].map((freq) => {
    const f = ctx.createBiquadFilter();
    f.type = 'peaking';
    f.frequency.value = freq;
    f.Q.value = 1.4;
    f.gain.value = 0;
    return f;
  });

  const gain = ctx.createGain();
  gain.gain.value = 1;

  // Chain: src → band0 → ... → band7 → gain → destination
  src.connect(bands[0]);
  for (let i = 0; i < bands.length - 1; i++) { bands[i].connect(bands[i + 1]); }
  bands[bands.length - 1].connect(gain);
  gain.connect(ctx.destination);

  tabs[tabId] = { ctx, gain, bands };
}

// Capture tab audio stream
async function getStream(streamId) {
  return navigator.mediaDevices.getUserMedia({
    audio: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: streamId } },
  });
}

// ── Message Router ──────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  // Only handle messages addressed to offscreen
  if (msg.target !== 'offscreen') return;

  (async () => {
    try {
      const t = msg.tabId;

      // Return current audio state
      if (msg.action === 'getState') {
        if (!tabs[t]) { respond(null); return; }
        respond({
          vol: Math.round(tabs[t].gain.gain.value * 100),
          eq: tabs[t].bands.map((b) => parseFloat(b.gain.value.toFixed(1))),
        });
        return;
      }

      // Change volume
      if (msg.action === 'setVol') {
        if (!tabs[t]) {
          const stream = await getStream(msg.streamId);
          initTab(t, stream);
        }
        tabs[t].gain.gain.value = msg.value / 100;
        respond(null);
        return;
      }

      // Change EQ
      if (msg.action === 'setEQ') {
        if (!tabs[t]) {
          const stream = await getStream(msg.streamId);
          initTab(t, stream);
        }
        const gains = msg.gains;
        for (let i = 0; i < tabs[t].bands.length && i < gains.length; i++) {
          tabs[t].bands[i].gain.value = gains[i];
        }
        respond(null);
        return;
      }

      // Tab closed
      if (msg.action === 'closeTab') {
        if (tabs[t]) { tabs[t].ctx.close(); delete tabs[t]; }
        respond(null);
        return;
      }

      respond(null);
    } catch (e) {
      console.error('HypeVox offscreen error:', e);
      respond(null);
    }
  })();

  return true;
});
