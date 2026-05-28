/**
 * HypeVox — Background Service Worker
 * Creates offscreen document and relays audio control messages.
 * MIT License — github.com/sahinguclu/HypeVox
 */

const OFFSCREEN = 'engine.html';

// ── Offscreen lifecycle ─────────────────────────────────

async function hasDoc() {
  try {
    if ('getContexts' in chrome.runtime) {
      const ctxs = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [chrome.runtime.getURL(OFFSCREEN)],
      });
      return ctxs.length > 0;
    }
    const clients = await self.clients.matchAll();
    return clients.some((c) => c.url.includes(chrome.runtime.id) && c.url.includes(OFFSCREEN));
  } catch { return false; }
}

async function boot() {
  if (await hasDoc()) return;
  await chrome.offscreen.createDocument({
    url: OFFSCREEN,
    reasons: ['USER_MEDIA'],
    justification: 'Audio capture for tab volume control and equalization.',
  });
}

// ── Relay helper ────────────────────────────────────────

function relay(msg) {
  return chrome.runtime.sendMessage({ ...msg, target: 'offscreen' });
}

// ── Message handler ─────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  if (msg.target !== 'background') return;

  (async () => {
    try {
      await boot();

      // Boot only
      if (msg.action === 'boot') { respond(null); return; }

      // Volume / EQ: get stream ID if needed, then relay
      if (msg.action === 'setVol' || msg.action === 'setEQ') {
        const existing = await relay({ action: 'getState', tabId: msg.tabId });
        if (!existing) {
          msg.streamId = await chrome.tabCapture.getMediaStreamId({
            targetTabId: msg.tabId,
          });
        }
        const result = await relay(msg);
        respond(result);
        return;
      }

      respond(null);
    } catch (e) {
      console.error('HypeVox bg error:', e);
      respond(null);
    }
  })();

  return true;
});

// ── Tab cleanup ─────────────────────────────────────────

chrome.tabs.onRemoved.addListener(async (tabId) => {
  await boot();
  await relay({ action: 'closeTab', tabId });
});
