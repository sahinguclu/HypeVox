# 🎛️ HypeVox

> Advanced audio control for any browser tab — volume boost up to 1000%, 8-band graphic equalizer, and real-time frequency visualizer.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-6366f1?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/) *(currently under review)*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ Features

- **Volume Boost** — Control any tab from Mute (0%) to **1000%**
- **8-Band Graphic EQ** — Vertical sliders per band (63Hz–8kHz, ±12dB)
- **Quick Presets** — Flat, Bass, Voice, Treble, Loud
- **Live Visualizer** — Real-time frequency spectrum
- **Domain Memory** — Remembers your volume per website
- **Dark Mode** — Toggle between light and dark
- **Keyboard Shortcuts** — `0`–`8` for landmarks, arrows for fine control
- **Audible Tabs** — See and switch to any tab playing audio
- **Zero Trackers** — No analytics, no external calls

### Volume Landmarks

| Key | Level |
|---|---|
| `0` | Mute (0%) |
| `1` | 50% |
| `2` | **100%** (Default) |
| `3` | 150% |
| `4` | 200% |
| `5` | 300% |
| `6` | 500% |
| `7` | 750% |
| `8` | 1000% |

## 📁 Structure

```
HypeVox/
├── manifest.json          # Chrome MV3 manifest
├── core.js                # Service worker
├── engine.js              # Audio processor (Web Audio API)
├── engine.html            # Engine host
├── panel.html             # Popup interface
├── panel.js               # Popup controller
├── theme.css              # Stylesheet (light/dark)
├── languages.js           # 35 language translations
├── assets/                # Icons & logo
├── _locales/en/           # Chrome i18n strings
├── LICENSE                # MIT
└── README.md
```

## 🚀 Install

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `HypeVox` folder

## 🛠 Tech

- Manifest V3
- Web Audio API
- Vanilla JavaScript — zero dependencies
- CSS custom properties (light/dark)

## 📄 License

MIT © [Şahin Güçlü](https://github.com/sahinguclu)

[Source Code](https://github.com/sahinguclu/HypeVox)
