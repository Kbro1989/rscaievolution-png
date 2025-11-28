# Credits & Attribution

## Original Game
**RuneScape Classic** is the intellectual property of **Jagex Ltd**.
- All game mechanics, item names, and core gameplay concepts are inspired by the original RuneScape Classic (2001-2018).
- This project is a fan-made tribute and educational prototype - not affiliated with or endorsed by Jagex.
- In the interest of the game's integrity and the future of these tools, please do not publicly share leaks or unreleased content.

## Third-Party Libraries & Assets

### Globe Visualization
- **Cobe** - WebGL globe visualization library
- **Author**: [shuding](https://github.com/shuding/cobe)
- **License**: MIT
- **Usage**: Interactive 3D globe rendering for world map, originally created for Cloudflare
- **Repository**: https://github.com/shuding/cobe
- **Note**: Globe implementation customized with continent boundaries and marker systems

### Audio & Sound Effects
- **@2003scape/rsc-sounds** - RuneScape Classic sound effects library
- **Repository**: https://github.com/2003scape/rsc-sounds
- **License**: GNU AGPLv3
- **Usage**: Original RSC sound effects for authentic retro game audio
- **Credits**: RuneScape Classic preservation community

### RSMV (RuneScape Model Viewer)
- **Author**: [Skillbert](https://github.com/skillbert/rsmv)
- **License**: MIT
- **Usage**: Cache decoding, model loading, and texture extraction utilities
- **Repository**: https://github.com/skillbert/rsmv
- **Credits**:
  - Modern rewrite by Skillbert
  - Based on downloader/3D viewer by Sahima, UI by [manpaint](https://github.com/manpaint)
  - 2D map based on code by [mejrs](https://github.com/mejrs)
  - Cache loader based on code by [villermen](https://github.com/villermen)

### Keep RSC Alive Foundation
- **Organization**: [2003Scape / RSC Preservation Project](https://github.com/2003scape)
- **Usage**: RSC repository textures, sprites, sounds, and asset references
- **Special Thanks**: Community efforts to preserve RuneScape Classic history
- **Related Repositories**:
  - [rsc-data](https://github.com/2003scape/rsc-data) - Game data and definitions ✅ **INTEGRATED**
  - [rsc-sprites](https://github.com/2003scape/rsc-sprites) - Original sprites ✅ **INTEGRATED**
  - [rsc-sounds](https://github.com/2003scape/rsc-sounds) - Sound effects library ✅ **INTEGRATED**
  - [rsc-archiver](https://github.com/2003scape/rsc-archiver) - Archive utilities

**Integrated Assets**:
- **Sound Effects**: 37 authentic RSC .wav files copied to `/public/audio/rsc`
  - Combat sounds (combat1a.wav, combat2a.wav, etc.)
  - Gathering sounds (mine.wav, fish.wav, cooking.wav)
  - UI sounds (click.wav, coins.wav, eat.wav)
  - Prayer/magic sounds (prayeron.wav, spellok.wav, etc.)
- **Game Data**: JSON definitions copied to `/services/data/rsc`
  - items.json (450KB) - All RSC item definitions
  - npcs.json (613KB) - All RSC NPC definitions
  - objects.json (348KB) - All RSC object definitions
  - spells.json, prayers.json, animations.json, etc.

### Core Dependencies
- **React** (MIT) - UI Framework
- **Three.js** (MIT) - 3D Rendering Engine
- **@react-three/fiber** (MIT) - React renderer for Three.js
- **@react-three/drei** (MIT) - Helper components for R3F
- **Tailwind CSS** (MIT) - Utility-first CSS framework
- **Vite** (MIT) - Build tool and dev server
- **Lucide React** (MIT) - Icon library
- **Three-Noise** (MIT) - Perlin noise for procedural generation

### Services & Infrastructure
- **Cloudflare Pages** - Static site hosting and deployment
- **Cloudflare Workers** - Serverless backend runtime
- **Cloudflare Workers AI** - AI model inference for NPC dialogue and procedural content generation
- **Cloudflare KV** - Key-value storage for game state and session data
- **Cloudflare D1** - SQLite database for persistent player data and world state
- **GitHub** - Version control, repository hosting, and CDN for models/assets via GitHub Pages
- **Google Generative AI** - Supplemental AI integration for advanced content generation

## Game Assets & Data

### Textures & Models
- Classic RSC textures sourced from [2003scape/rsc-data](https://github.com/2003scape/rsc-data)
- Classic RSC sprites from [2003scape/rsc-sprites](https://github.com/2003scape/rsc-sprites)
- Procedurally generated models use geometry inspired by RuneScape Classic's low-poly aesthetic

### Audio
- Sound effects generated using Web Audio API (`AudioContext` oscillators)
- Voice synthesis powered by browser's native `SpeechSynthesis` API

## Development

### Project Structure
This project was built as an educational prototype to explore:
- Client-server architecture for MMORPGs
- AI-driven NPC behavior systems
- Procedural content generation
- Evolution-based progression systems

### Special Recognition
- **Jagex** - For creating the legendary RuneScape universe
- **RSC Community** - For preserving the game's history and making resources available
- **Open Source Contributors** - All the developers who maintain the libraries this project depends on

## Legal Notice

This is a non-commercial, educational fan project. All trademarks, service marks, trade names, trade dress, product names, and logos appearing in this project are the property of their respective owners.

If you are a copyright holder and believe any content in this repository infringes your rights, please contact the repository owner for immediate removal.

## License

This fan project's custom code is available for educational purposes. All third-party assets and libraries retain their original licenses as specified above.

---

**Last Updated**: November 2025
