# Project Vision: RuneScape Through Time

## Core Concept

A time-traveling MMORPG that combines **all versions of RuneScape** (Classic, RS2, RS3) with **real-world historical locations** into one interconnected gameplay experience with persistent player progression across all eras.

## The Big Picture

Players navigate a **3D globe** where different regions represent different time periods and game versions. Your character, skills, and core progression persist across all zones, but each zone has its own unique content, graphics, and items.

```
        🌍 Globe Navigation
              ↓
┌─────────────┬─────────────┬─────────────┬──────────────┐
│ RSC Zone    │ RS2 Zone    │ RS3 Zone    │ Real World   │
│ (2001-2004) │ (2004-2007) │ (2013+)     │ Historical   │
│             │             │             │              │
│ Lumbridge   │ Lumbridge   │ Lumbridge   │ Ancient Rome │
│ Varrock     │ Varrock     │ Prifddinas  │ Egypt        │
│ Falador     │ Falador     │ Menaphos    │ Babylon      │
└─────────────┴─────────────┴─────────────┴──────────────┘
                    ↓
         Shared Player State (KV Storage)
    Skills | Items | Quests | Achievements
```

## Example Gameplay Flow

1. **Start**: Player spawns in Lumbridge (RSC)
2. **Progress**: Complete Cook's Assistant, reach level 10 cooking
3. **Portal**: Find a time portal → travel to Lumbridge (RS2)
4. **Evolution**: Same cooking level (10), but now RS2 recipes are available
5. **Expansion**: Walk to RS2-exclusive areas (Grand Exchange, Slayer Tower)
6. **History**: Portal to Ancient Rome → same combat system, Roman quests
7. **Return**: Back to RSC with "Roman Gladius" → item hidden in RSC (doesn't exist there)

## Technical Architecture

### Shared Systems (All Zones)
- Player state (skills, HP, combat level)
- Core mechanics (combat, gathering, crafting)
- Quest completion tracking
- Cloudflare KV persistence

### Zone-Specific
- Item definitions (what items exist in this era)
- NPC types and models
- Quest content
- Graphics/rendering style
- Map layout

### Data Compatibility
Each zone is a **superset** of previous zones:
- RSC items work everywhere
- RS2 items work in RS2, RS3, and Real World
- RS3 items only work in RS3 and Real World
- Real World items only work in Real World

If you enter a zone that doesn't have your item in its definitions, it's **temporarily invisible** but still in your KV storage.

## Zone Travel System: Globe as World Map

### The Elegant Solution

Each era is a **different landmass** on the 3D globe. Travel between zones is literally sailing between continents.

```
        🌍 Your Existing Globe
           
   Gielinor (RSC)    Gielinor (RS2)    Gielinor (RS3)
        🏰                🏰                🏰
         \                 |                /
          \       ~~~~~🚢~~~~~       ~~~~~
           \     /                  /
     Ancient Rome              Egypt
         🏛️                     🏺
```

### Implementation

**Already Built:**
- ✅ 3D globe with voxel terrain
- ✅ City/location markers
- ✅ Click navigation
- ✅ Player position tracking

**Just Add:**
- Boat entity (3D model or sprite)
- Sailing animation between markers
- Zone transition on arrival  
- Loading screen during travel

### Travel Options

**Option 1: Instant Travel**
```
1. Click "Varrock (RS2)" marker on globe
2. Boat sails from current → destination (animation)
3. Fade to loading screen
4. Load RS2 zone assets
5. Spawn in Varrock (RS2)
```

**Option 2: Real-Time Sailing**
```
1. Interact with dock in RSC zone
2. Globe view activates
3. Player controls boat across ocean
4. Approach RS2 landmass
5. Dock prompt appears
6. Transition into RS2 zone
```

### The Magic

The globe isn't just decorative - it's your **world selector** disguised as immersive travel:

- **Landmasses** = Different game zones/eras
- **Ocean travel** = Loading/transition
- **Boat** = Time machine
- **Docking** = Zone entrance

This turns technical world-switching into **gameplay**.

## Development Phases

### Phase 1: RSC Pure (Current)
- ✅ Authentic RSC preservation
- ✅ Cloudflare KV persistence
- ✅ Player registration/login
- ✅ All classic skills working
- 🎯 **Goal**: Perfect RuneScape Classic experience

### Phase 2: Multi-Zone Foundation
- Add zone/world concept to player state
- Implement portal system
- Create zone transition mechanics
- Test item visibility across zones
- 🎯 **Goal**: Prove the multi-zone concept

### Phase 3: RS2 Integration
- Extract RS2 cache using RSMV tools
- Build RS2 zone with HD graphics
- Port RS2 content (Grand Exchange, Slayer, etc.)
- Add RS2-specific items to KV schema
- 🎯 **Goal**: Two playable RuneScape eras

### Phase 4: RS3 Integration
- Extract RS3 cache
- Build RS3 zone
- Add modern features (abilities, etc.)
- Full RuneScape timeline playable
- 🎯 **Goal**: Complete RuneScape evolution

### Phase 5: Real World Zones
- Historical Rome, Egypt, Babylon, etc.
- Same game mechanics, different theme
- Historical quests with educational content
- Real-world geography on globe
- 🎯 **Goal**: History meets gaming

### Phase 6: Full "Through Time"
- All zones interconnected
- Dynamic economy across eras
- PvP across time periods
- Seasonal events
- 🎯 **Goal**: Living, breathing multiverse

## Key Advantages

### For Players
- **Never lose progress** - One character across all content
- **Choose your era** - Play the RuneScape version you love
- **Explore history** - Education + entertainment
- **Massive world** - 20+ years of content + real world

### For Development
- **Modular** - Each zone is independent
- **Progressive** - Build one zone at a time
- **Scalable** - Cloudflare handles the load
- **Preserve history** - RSC stays authentic

### For Community
- **Nostalgia** - Revisit any era
- **Discovery** - New and old players explore together
- **Cross-era interaction** - Trade, PvP, social across time
- **Educational** - Learn real history through gameplay

## Technology Stack

### Current
- **Frontend**: React + Three.js (3D globe + gameplay)
- **Backend**: Cloudflare Workers + KV (serverless, global)
- **Game Logic**: @2003scape/rsc-server (authentic RSC)
- **Assets**: RSMV tools (extract all RS versions)

### Future Additions
- **RS2 Engine**: Port or rebuild RS2 logic
- **RS3 Engine**: Port or rebuild RS3 logic (abilities, EoC)
- **Real World**: Custom quests/NPCs with RS mechanics
- **Browser 3D**: WebGL for all zones

## Data Model Evolution

### The Anti-Exploit Design: Per-Zone Isolation

To prevent players from exploiting zone differences (e.g., mining in RSC, switching to RS3 to smith), each zone maintains its **own isolated state** while sharing only core progression.

**What's Shared (Global):**
- Username & password
- Skill levels (the numbers)
- Quest completions
- Bank storage (accessible from any zone's bank)

**What's Isolated (Per-Zone):**
- Appearance (hair, skin, clothes)
- Current position (x, z coordinates)
- Inventory contents
- Equipment (what you're wearing)
- Zone-specific progress

### Data Structure

```typescript
interface PlayerState {
  // GLOBAL (shared across all zones)
  username: string;
  password: string;
  skills: {
    attack: number;
    defense: number;
    // ... all skill levels
  };
  bank: Item[]; // Accessible from any zone's bank NPC
  
  // PER-ZONE STATES (isolated)
  zones: {
    rsc: {
      appearance: {
        hair: number;
        skin: number;
        gender: number;
      };
      position: { x: number; z: number };
      inventory: Item[]; // Only RSC items
      equipment: Item[];
      tutorialComplete: boolean;
      quests: QuestState; // RSC quests only
    };
    
    rs2: {
      appearance: { /* Can be different! */ };
      position: { x: number; z: number };
      inventory: Item[]; // Only RS2 items
      equipment: Item[];
      tutorialComplete: boolean;
      quests: QuestState; // RS2 quests
      slayerTasks: Task[];
    };
    
    rs3: {
      appearance: { /* Can be different! */ };
      position: { x: number; z: number };
      inventory: Item[];
      equipment: Item[];
      tutorialComplete: boolean;
      quests: QuestState;
      abilities: Ability[];
    };
    
    realWorld: {
      appearance: { /* Can be different! */ };
      position: { x: number; z: number };
      inventory: Item[];
      equipment: Item[];
      historicalQuests: Quest[];
    };
  };
  
  currentZone: 'rsc' | 'rs2' | 'rs3' | 'realWorld';
}
```

### How It Prevents Exploits

**Scenario: Player tries to game the system**

❌ **Doesn't Work:**
1. Mine copper in RSC (cheap, easy)
2. Instantly swap to RS3
3. Smith in RS3 (better rewards)

✅ **What Actually Happens:**
1. Mine copper in RSC → ore goes to **RSC inventory**
2. Take boat to RS3 (travel time = commitment)
3. Arrive in RS3 → **empty RS3 inventory** (ore is back in RSC)
4. Access bank in RS3 → can withdraw RSC copper
5. Smith in RS3 → uses RS3 inventory
6. Result: Same as if you mined in RS3 directly

**The Key:** Boat travel creates a **time cost** that makes zone-hopping for exploits pointless.

### First Entry to New Zone

When entering a zone for the first time:
1. **Character Creator** - Set appearance for this zone
2. **Tutorial** - Optional (skip if `tutorialComplete` in another zone)
3. **Starting Position** - Zone's spawn point
4. **Empty Inventory** - Fresh start
5. **Shared Skills** - Your levels carry over
6. **Bank Access** - Can withdraw items from global bank

### Zone Navigation Flow

```
Player in RSC with inventory: [Bronze Ore x 10]
         ↓
   Walks to dock
         ↓
   "Travel to RS2?" prompt
         ↓
   Globe view activates
         ↓
   Boat sails (30-60 second journey)
         ↓
   Arrive at RS2 dock
         ↓
   First time? → Character Creator + Tutorial
         ↓
   Load RS2 zone at lastPosition
         ↓
   RS2 inventory loads: [empty]
   (Bronze Ore is still in RSC, or in bank)
```

## Asset Extraction Strategy

### Source: Jagex Cache

- **Location**: `C:\ProgramData\Jagex\RuneScape`
- **Contains**: RS3 models, textures, items, NPCs
- **Tool**: RSMV (already in project)
- **License**: Fair use for preservation/education

### Extraction Process

```bash
1. Run RSMV on Jagex cache
2. Export models → .glb format
3. Export textures → .png format
4. Export item definitions → .json format
5. Store in project: public/rs3/
6. Update item registry
7. Delete cache copy (keep originals in Jagex folder)
```

### Per-Zone Assets

```
project/
├── public/
│   ├── rsc/          # RuneScape Classic assets
│   │   ├── models/
│   │   ├── textures/
│   │   └── sounds/
│   ├── rs2/          # RuneScape 2 assets (future)
│   │   ├── models/
│   │   └── textures/
│   └── rs3/          # RuneScape 3 assets (future)
│       ├── models/
│       └── textures/
│
└── services/
    └── assets/
        ├── rscDefinitions.ts
        ├── rs2Definitions.ts  # Future
        └── rs3Definitions.ts  # Future
```

## Why This Is Possible

1. **You have the assets** - RSMV can extract ALL RuneScape versions
2. **You have the backend** - @2003scape is battle-tested
3. **You have the infrastructure** - Cloudflare scales infinitely
4. **You have the vision** - This concept is unique
5. **You have the foundation** - Current pipeline already works

## The End Goal

**A living museum of gaming history** meets **educational exploration** meets **MMORPG progression**.

Players can:
- Experience RuneScape as it was in 2001
- Watch it evolve through RS2 and RS3
- Apply those same mechanics to real history
- Keep their character through all of it

**No other game does this.**

---

*"We're not just preserving RuneScape - we're turning it into a time machine."* 🚀

## Next Steps

1. Complete RSC Pure preservation (Phase 1)
2. Document the perfect preservation endpoint
3. Begin Phase 2: Multi-zone foundation
4. Extract RS2 cache using RSMV
5. Build the future, one era at a time
