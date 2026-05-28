# 🎛️ HypeVox

> Audio control for any browser tab — volume up to 1000%, 12 sound profiles, 54 languages, and zero trackers.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-6366f1?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/) *(currently under review)*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ Features

- **Volume Boost** — Control any tab from Mute (0%) to **1000%**
- **12 Sound Profiles** — Equalizer presets: Bass, Voice, Treble, Loudness, Podcast, Rock, Pop, Jazz, Hip-Hop, Classical, Electronic
- **Dark Mode** — Toggle between light and dark, preference saved
- **Keyboard Shortcuts** — `0`–`8` for landmarks, arrow keys for fine control
- **Audible Tabs** — See and switch to any tab playing audio
- **54 Languages** — Full UI translations: English, Turkish, Spanish, French, German, Russian, Chinese, Japanese, Sinhala, and more
- **Zero Trackers** — No analytics, no telemetry, no external calls

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
├── languages.js           # 54 language UI translations
├── assets/                # Icons & logo
│   ├── HV-logo.png        # App logo
│   ├── icon-16.png        # Toolbar icons
│   ├── icon-19.png        # (16, 19, 32, 38, 48, 128)
│   └── ...
├── _locales/              # Chrome i18n (54 languages)
│   ├── en/                # English
│   └── ...                # (tr, de, fr, es, ru, ja, zh_CN, etc.)
├── PRIVACY.md             # Privacy policy
├── LICENSE                # MIT
└── README.md
```

## 🚀 Install

1. Download the latest `HypeVox.zip` from [Releases](https://github.com/sahinguclu/HypeVox/releases)
2. Unzip the file to a folder on your computer
3. Open `chrome://extensions`
4. Enable **Developer mode** (top-right toggle)
5. Click **Load unpacked**
6. Select the unzipped `HypeVox` folder

> ⚠️ **Note:** Installing via developer mode means the extension **won't auto-update**. Check the Releases page periodically for new versions and repeat the steps above to update.

## 🛠 Tech

- Manifest V3
- Web Audio API
- Vanilla JavaScript — zero dependencies
- CSS custom properties (light/dark)

## 📄 License

MIT © [Şahin Güçlü](https://github.com/sahinguclu)

[Source Code](https://github.com/sahinguclu/HypeVox)
