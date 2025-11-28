// Ancient Locations Database (1000-5000 BCE)
// Comprehensive catalog of ancient civilization sites with mythology and lore

export interface AncientLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  tier: 1 | 2 | 3; // Importance: 1=Major cities, 2=Sacred sites, 3=Settlements
  category: 'CITY' | 'TEMPLE' | 'ZIGGURAT' | 'PYRAMID' | 'MEGALITH' | 'SETTLEMENT' | 'SACRED_SITE';
  civilization: string;
  dateRange: { start: number; end: number }; // BCE years
  lore: {
    history: string;
    mythology: string[];
    deities: string[];
    significance: string;
  };
  modernName?: string;
  sceneTarget?: string; // Future: Link to playable area
}

// ============================================================================
// TIER 1: MAJOR CITIES & CAPITALS
// ============================================================================

export const MESOPOTAMIAN_CITIES: AncientLocation[] = [
  {
    id: 'uruk',
    name: 'Uruk',
    lat: 31.32,
    lng: 45.63,
    tier: 1,
    category: 'CITY',
    civilization: 'Sumerian',
    dateRange: { start: 4000, end: 2000 },
    lore: {
      history: 'The world\'s first true city, Uruk was the birthplace of writing (cuneiform) and urban civilization. At its peak around 2900 BCE, it housed 50,000-80,000 people within massive walls.',
      mythology: [
        'Home of Gilgamesh, the legendary king who sought immortality',
        'The White Temple atop the Anu Ziggurat was dedicated to the sky god',
        'Inanna, goddess of love and war, was the city\'s patron deity'
      ],
      deities: ['Anu (Sky)', 'Inanna (Love/War)', 'Gilgamesh (Hero-King)'],
      significance: 'Birthplace of civilization, writing, and the Epic of Gilgamesh - humanity\'s oldest recorded story.'
    },
    sceneTarget: 'URUK'
  },
  {
    id: 'ur',
    name: 'Ur',
    lat: 30.96,
    lng: 46.10,
    tier: 1,
    category: 'ZIGGURAT',
    civilization: 'Sumerian',
    dateRange: { start: 3800, end: 2000 },
    lore: {
      history: 'Ancient port city and religious center. The Great Ziggurat of Ur (built ~2100 BCE) was a massive stepped pyramid temple. Biblical tradition identifies Ur as Abraham\'s birthplace.',
      mythology: [
        'The moon god Nanna\'s primary temple stood here',
        'Royal tombs contained elaborate death pits with sacrificed retainers',
        'City believed to be protected by lunar divine power'
      ],
      deities: ['Nanna/Sin (Moon)', 'Ningal (Moon goddess consort)'],
      significance: 'Major religious center and possible birthplace of Abraham, father of monotheism.'
    },
    sceneTarget: 'UR'
  },
  {
    id: 'eridu',
    name: 'Eridu',
    lat: 30.82,
    lng: 47.38,
    tier: 1,
    category: 'TEMPLE',
    civilization: 'Sumerian',
    dateRange: { start: 5400, end: 2000 },
    lore: {
      history: 'According to Sumerian tradition, Eridu was the first city ever created by the gods, where kingship first descended from heaven. Archaeologically one of the oldest settlements in southern Mesopotamia.',
      mythology: [
        'Primordial temple of Enki, god of wisdom and fresh water',
        'The Abzu (cosmic ocean of sweet water) lay beneath the temple',
        'Enki saved humanity from the Great Flood by warning Ziusudra'
      ],
      deities: ['Enki/Ea (Wisdom/Water)', 'Ninhursag (Mother goddess)'],
      significance: 'Legendary first city of the gods; center of water cult and source of Mesopotamian flood myth.'
    },
    sceneTarget: 'ERIDU'
  },
  {
    id: 'nippur',
    name: 'Nippur',
    lat: 32.13,
    lng: 45.23,
    tier: 1,
    category: 'TEMPLE',
    civilization: 'Sumerian',
    dateRange: { start: 5000, end: 800 },
    lore: {
      history: 'Nippur was never a political capital but served as the religious heart of Mesopotamia for over 3000 years. Control of Nippur\'s Ekur temple legitimized kings\' divine right to rule.',
      mythology: [
        'Home of Enlil, king of the gods and lord of the storm',
        'The Ekur ("Mountain House") temple was the cosmic axis mundi',
        'Tablets of destiny stored here determined fate of all creation'
      ],
      deities: ['Enlil (Air/Storm/Authority)', 'Ninlil (Grain goddess)'],
      significance: 'Supreme religious authority of Mesopotamia; possessing Nippur meant divine kingship approval.'
    },
    sceneTarget: 'NIPPUR'
  }
];

export const EGYPTIAN_SITES: AncientLocation[] = [
  {
    id: 'memphis',
    name: 'Memphis',
    lat: 29.85,
    lng: 31.25,
    tier: 1,
    category: 'CITY',
    civilization: 'Egyptian',
    dateRange: { start: 3100, end: 641 },
    modernName: 'Mit Rahina',
    lore: {
      history: 'Founded by Pharaoh Menes (Narmer) around 3100 BCE as the first capital of unified Egypt. Remained Egypt\'s administrative and religious center for over 3000 years.',
      mythology: [
        'Sacred to Ptah, the creator god who spoke the world into existence',
        'Site where Upper and Lower Egypt were first unified',
        'The Apis Bull, living incarnation of Ptah, was worshipped here'
      ],
      deities: ['Ptah (Creation/Craftsmen)', 'Sekhmet (War/Healing)', 'Apis (Sacred Bull)'],
      significance: 'First capital of unified Egypt; center of Ptah creation theology and divine craftmanship.'
    },
    sceneTarget: 'MEMPHIS'
  },
  {
    id: 'thebes',
    name: 'Thebes',
    lat: 25.70,
    lng: 32.64,
    tier: 1,
    category: 'TEMPLE',
    civilization: 'Egyptian',
    dateRange: { start: 3200, end: 27 },
    modernName: 'Luxor',
    lore: {
      history: 'Rose to prominence in Middle Kingdom (~2055 BCE) and became Egypt\'s religious capital. The Karnak temple complex grew over 2000 years into the largest religious building ever constructed.',
      mythology: [
        'City of Amun-Ra, king of gods and source of pharaonic power',
        'Annual Opet Festival renewed the pharaoh\'s divine mandate',
        'Valley of the Kings nearby held the tombs of New Kingdom pharaohs'
      ],
      deities: ['Amun-Ra (Sun/Creation)', 'Mut (Mother goddess)', 'Khonsu (Moon)'],
      significance: 'Religious capital of Egypt\'s empire; Karnak housed the richest priesthood in the ancient world.'
    },
    sceneTarget: 'THEBES'
  },
  {
    id: 'abydos',
    name: 'Abydos',
    lat: 26.18,
    lng: 31.92,
    tier: 1,
    category: 'SACRED_SITE',
    civilization: 'Egyptian',
    dateRange: { start: 4000, end: 550 },
    lore: {
      history: 'One of Egypt\'s oldest cities and most important pilgrimage sites. Every Egyptian aspired to visit or be buried at Abydos to ensure passage to the afterlife.',
      mythology: [
        'Sacred to Osiris, god of resurrection and the afterlife',
        'Site where Osiris\'s head was buried after Set murdered him',
        'Annual passion play reenacted Osiris\'s death and rebirth',
        'Gateway to the Duat (Egyptian underworld)'
      ],
      deities: ['Osiris (Afterlife/Resurrection)', 'Isis (Magic)', 'Wepwawet (Opener of Ways)'],
      significance: 'Egypt\'s holiest necropolis; center of Osiris cult and promise of eternal life.'
    },
    sceneTarget: 'ABYDOS'
  },
  {
    id: 'heliopolis',
    name: 'Heliopolis',
    lat: 30.13,
    lng: 31.30,
    tier: 1,
    category: 'TEMPLE',
    civilization: 'Egyptian',
    dateRange: { start: 3100, end: 30 },
    modernName: 'Cairo suburb (Ain Shams)',
    lore: {
      history: 'Ancient religious center north of Memphis, famous for its priesthood\'s astronomical and mathematical knowledge. Almost nothing remains of the great temple today.',
      mythology: [
        'Birthplace of the sun god Ra, where he first rose from the primordial waters',
        'The Benben stone (sacred meteoric iron) sat atop Ra\'s temple',
        'Creation myth: Atum masturbated/sneezed forth Shu (air) and Tefnut (moisture)',
        'Solar calendar and geometry developed by Heliopolitan priests'
      ],
      deities: ['Ra/Atum (Sun/Creation)', 'Shu (Air)', 'Tefnut (Moisture)', 'Nut (Sky)'],
      significance: 'Center of solar theology and Egyptian cosmology; origin of the 365-day calendar.'
    },
    sceneTarget: 'HELIOPOLIS'
  }
];

export const INDUS_VALLEY_SITES: AncientLocation[] = [
  {
    id: 'harappa',
    name: 'Harappa',
    lat: 30.63,
    lng: 72.87,
    tier: 1,
    category: 'CITY',
    civilization: 'Indus Valley',
    dateRange: { start: 3300, end: 1300 },
    lore: {
      history: 'One of two major urban centers of the Indus Valley Civilization. Featured advanced urban planning with grid layout, covered drainage, and standardized brick sizes.',
      mythology: [
        'Worship of a Mother Goddess figure (fertility and agriculture)',
        'Proto-Shiva imagery on seals (horned deity in meditative pose)',
        'Sacred bull motifs suggest cattle worship',
        'Ritual bathing platforms indicate water purification rites'
      ],
      deities: ['Mother Goddess (fertility)', 'Proto-Shiva (meditation/nature)', 'Sacred Bull'],
      significance: 'First urban civilization in South Asia; advanced city planning and standardization.'
    },
    sceneTarget: 'HARAPPA'
  },
  {
    id: 'mohenjo_daro',
    name: 'Mohenjo-daro',
    lat: 27.33,
    lng: 68.14,
    tier: 1,
    category: 'CITY',
    civilization: 'Indus Valley',
    dateRange: { start: 2500, end: 1900 },
    modernName: 'Mound of the Dead',
    lore: {
      history: 'Largest city of the Indus civilization, featuring the famous Great Bath and sophisticated water management. Mysteriously declined around 1900 BCE.',
      mythology: [
        'The Great Bath (39×23 ft) was likely used for ritual purification',
        'Dancing Girl statue suggests temple dancers or sacred prostitution',
        'Abundance of phallic symbols and yoni stones (fertility worship)',
        'Mysterious undeciphered script may contain hidden religious texts'
      ],
      deities: ['Mother Goddess', 'Lord of Beasts (proto-Pashupati)', 'Serpent deities'],
      significance: 'Peak of Indus urban sophistication; Great Bath shows importance of ritual purity.'
    },
    sceneTarget: 'MOHENJO_DARO'
  }
];


// ============================================================================
// TIER 2: SACRED SITES & REGIONAL CENTERS
// ============================================================================

export const MESOPOTAMIAN_TIER2: AncientLocation[] = [
  {
    id: 'babylon',
    name: 'Babylon',
    lat: 32.54,
    lng: 44.42,
    tier: 2,
    category: 'CITY',
    civilization: 'Babylonian',
    dateRange: { start: 2300, end: 539 },
    lore: {
      history: 'Initially a minor city, rose to dominance under Hammurabi (1792 BCE). Home of the Hanging Gardens, one of Seven Wonders. Cultural heir to Sumerian civilization.',
      mythology: [
        'Marduk, dragon-slayer and king of gods, had his temple here',
        'Ishtar Gate and Processional Way led to Esagila (House of the Raised Head)',
        'Tower of Babel legend may refer to Etemenanki ziggurat',
        'Center of astrology and mathematical astronomy'
      ],
      deities: ['Marduk (Supreme god)', 'Ishtar (Love/War)', 'Nabu (Wisdom/Writing)'],
      significance: 'Cultural capital of Mesopotamia; Hammurabi\'s Code birthplace; center of mathematics.'
    },
    sceneTarget: 'BABYLON'
  },
  {
    id: 'kish',
    name: 'Kish',
    lat: 32.55,
    lng: 44.66,
    tier: 2,
    category: 'CITY',
    civilization: 'Sumerian',
    dateRange: { start: 3100, end: 1800 },
    lore: {
      history: 'One of the first cities to exercise hegemony in Sumer after the flood. Title "King of Kish" signified dominion over all of Sumer.',
      mythology: [
        'Legendary first dynasty after the Flood',
        'Etana, mythical king who flew to heaven on an eagle',
        'Priest-kings communed with sky gods from temple platforms'
      ],
      deities: ['Zababa (War god)', 'Inanna', 'Enlil'],
      significance: 'First post-Flood dynasty; "King of Kish" = imperial legitimacy in Mesopotamia.'
    },
    sceneTarget: 'KISH'
  },
  {
    id: 'lagash',
    name: 'Lagash',
    lat: 31.38,
    lng: 46.38,
    tier: 2,
    category: 'CITY',
    civilization: 'Sumerian',
    dateRange: { start: 2900, end: 2100 },
    lore: {
      history: 'Powerful city-state known for skilled sculptors and detailed administrative records. Gudea statues are masterpieces of Sumerian art.',
      mythology: [
        'Sacred to Ningirsu, warrior god and hero of the gods',
        'Built the Eninnu temple ("House of Fifty")',
        'Gudea\'s dream visions guided temple construction'
      ],
      deities: ['Ningirsu (War/Agriculture)', 'Bau (Healing goddess)', 'Nanshe (Social justice)'],
      significance: 'Artistic center; detailed cylinder seals and statues; model of temple administration.'
    }
  },
  {
    id: 'akkad',
    name: 'Akkad',
    lat: 33.10,
    lng: 44.05,
    tier: 2,
    category: 'CITY',
    civilization: 'Akkadian',
    dateRange: { start: 2334, end: 2154 },
    lore: {
      history: 'Capital of the world\'s first empire under Sargon the Great. Exact location unknown, somewhere in central Iraq. Merged Semitic and Sumerian cultures.',
      mythology: [
        'Sargon found abandoned as baby, raised by a gardener, became cupbearer then king',
        'Ishtar personally chose Sargon to unify all lands',
        'Akkadian became the lingua franca of the ancient world for 2000 years'
      ],
      deities: ['Ishtar/Inanna (Patron of Sargon)', 'Shamash (Sun/Justice)', 'Sin (Moon)'],
      significance: 'First multi-ethnic empire; Akkadian language standardization; imperial model for millennia.'
    }
  }
];

export const EGYPTIAN_TIER2: AncientLocation[] = [
  {
    id: 'giza',
    name: 'Giza',
    lat: 29.98,
    lng: 31.13,
    tier: 2,
    category: 'PYRAMID',
    civilization: 'Egyptian',
    dateRange: { start: 2580, end: 27 },
    lore: {
      history: 'Home of the Great Pyramid of Khufu, largest Ancient Wonder. Pyramid complex built during Old Kingdom\'s 4th Dynasty (2580-2560 BCE).',
      mythology: [
        'Great Pyramid aligned to Orion\'s Belt and true north',
        'Sphinx guards the necropolis, possibly representing Khafre',
        'Pyramid as ladder/ramp for pharaoh\'s soul to reach stars',
        'Boat pits contain solar barques for Ra\'s daily journey'
      ],
      deities: ['Ra (Sun)', 'Osiris (Afterlife)', 'Thoth (Wisdom)', 'Anubis (Mummification)'],
      significance: 'Last surviving Ancient Wonder; peak of pyramidbuilding; engineering mystery.'
    },
    sceneTarget: 'GIZA'
  },
  {
    id: 'elephantine',
    name: 'Elephantine Island',
    lat: 24.08,
    lng: 32.89,
    tier: 2,
    category: 'TEMPLE',
    civilization: 'Egyptian',
    dateRange: { start: 3000, end: 641 },
    modernName: 'Aswan',
    lore: {
      history: 'Strategic island at first cataract of the Nile. Gateway to Nubia and trade route to Africa. Important cult center for Khnum.',
      mythology: [
        'Khnum, ram-headed potter god, molded humans on his wheel',
        'Source/guardian of the Nile flood; controlled sacred waters',
        'Nilometer measured flood levels for agricultural predictions'
      ],
      deities: ['Khnum (Creation/Potter)', 'Satet (Nile floods)', 'Anuket (Nile goddess)'],
      significance: 'Gateway to Nubia; source of Nile theology; strategic military/trade fort.'
    }
  },
  {
    id: 'byblos',
    name: 'Byblos',
    lat: 34.12,
    lng: 35.65,
    tier: 2,
    category: 'CITY',
    civilization: 'Phoenician',
    dateRange: { start: 5000, end: 125 },
    modernName: 'Jbeil, Lebanon',
    lore: {
      history: 'Oldest continuously inhabited city. Primary cedar wood supplier to Egypt. Phoenician alphabet originated here.',
      mythology: [
        'Sacred to Adonis, dying-and-rising god of vegetation',
        'Greek myth: where Aphrodite first found slain Adonis',
        'Phoenician papyrus trade gave us word "Bible" (Byblos = book)',
        'Gateway between Egyptian and Mesopotamian cultures'
      ],
      deities: ['Baal/Adonis (Fertility)', 'Astarte (Love)', 'El (Father god)'],
      significance: 'Oldest city; birthplace of alphabet; cultural crossroads; papyrus = Bible etymology.'
    },
    sceneTarget: 'BYBLOS'
  }
];

export const ANATOLIAN_SITES: AncientLocation[] = [
  {
    id: 'catalhoyuk',
    name: 'Çatalhöyük',
    lat: 37.67,
    lng: 32.83,
    tier: 2,
    category: 'SETTLEMENT',
    civilization: 'Neolithic Anatolia',
    dateRange: { start: 7500, end: 5700 },
    modernName: 'Turkey',
    lore: {
      history: 'One of the world\'s first towns, housing up to 10,000 people. No streets - entered houses through roof! Elaborate wall paintings and bull shrines.',
      mythology: [
        'Mother Goddess figurines suggest matriarchal worship',
        'Bull horn shrines indicate cattle cult',
        'Vulture excarnation scenes on walls (sky burial)',
        'Obsidian mirrors used in shamanic rituals'
      ],
      deities: ['Mother Goddess (Fertility)', 'Bull deity (virility)', 'Vulture spirits (death)'],
      significance: 'First proto-city; egalitarian society; sophisticated art; early agriculture.'
    },
    sceneTarget: 'CATALHOYUK'
  },
  {
    id: 'alaca_hoyuk',
    name: 'Alaca Höyük',
    lat: 40.37,
    lng: 34.37,
    tier: 3,
    category: 'SETTLEMENT',
    civilization: 'Hatti',
    dateRange: { start: 3400, end: 1200 },
    modernName: 'Turkey',
    lore: {
      history: 'Bronze Age settlement with royal tombs containing golden artifacts. Hattic culture predated Hittites in central Anatolia.',
      mythology: [
        'Animal-shaped ritual standards suggest totem worship',
        'Sun goddess cult - solar disks in burials',
        'Sacred stag and bull imagery'
      ],
      deities: ['Sun Goddess', 'Storm God', 'Stag deity'],
      significance: 'Pre-Hittite civilization; metallurgy center; sun goddess cult.'
    }
  }
];

export const MEDITERRANEAN_TIER2: AncientLocation[] = [
  {
    id: 'knossos',
    name: 'Knossos',
    lat: 35.30,
    lng: 25.16,
    tier: 2,
    category: 'CITY',
    civilization: 'Minoan',
    dateRange: { start: 3000, end: 1100 },
    modernName: 'Crete, Greece',
    lore: {
      history: 'Largest Bronze Age palace on Crete. Multi-story labyrinthine complex with advanced plumbing. Center of Minoan thalassocracy (sea empire).',
      mythology: [
        'The Labyrinth where Minos imprisoned the Minotaur',
        'Theseus slew the bull-headed monster with Ariadne\'s thread',
        'Bull-leaping rituals (actual sport or symbolic)',
        'Home of King Minos, son of Zeus and Europa'
      ],
      deities: ['Potnia (Snake Goddess)', 'Bull deity', 'Zeus (later)', 'Poseidon'],
      significance: 'First European civilization; palace architecture; Linear A script; Minotaur legend.'
    },
    sceneTarget: 'KNOSSOS'
  },
  {
    id: 'trojadate',
    name: 'Troy',
    lat: 39.96,
    lng: 26.24,
    tier: 2,
    category: 'CITY',
    civilization: 'Trojan/Luwian',
    dateRange: { start: 3000, end: 500 },
    modernName: 'Hisarlık, Turkey',
    lore: {
      history: 'Strategic city controlling Dardanelles trade route. Nine layers of settlement. Troy VI/VIIa likely the Homeric Troy (~1300-1180 BCE).',
      mythology: [
        'Epic siege by Greeks led by Agamemnon (Iliad)',
        'Helen of Troy, most beautiful woman, sparked the war',
        'Trojan Horse stratagem ended 10-year siege',
        'Aeneas escaped to found Rome (Aeneid)'
      ],
      deities: ['Apollo (Trojan patron)', 'Athena & Hera (Greek patrons)', 'Zeus (moderator)'],
      significance: 'Homer\'s Iliad setting; Greek identity foundation; trade route control; Bronze Age collapse witness.'
    },
    sceneTarget: 'TROY'
  },
  {
    id: 'ggantija',
    name: 'Ġgantija',
    lat: 36.05,
    lng: 14.27,
    tier: 2,
    category: 'MEGALITH',
    civilization: 'Maltese Neolithic',
    dateRange: { start: 3600, end: 2500 },
    modernName: 'Gozo, Malta',
    lore: {
      history: 'Megalithic temple older than Stonehenge and Egypt\'s pyramids. Massive stones (50+ tons) worked without metal tools.',
      mythology: [
        'Giantess Sansuna built temple while nursing a baby',
        'Fat goddess figurines suggest fertility/mother cult',
        'Oracle chambers with acoustic properties'
      ],
      deities: ['The Giantess', 'Mother Goddess', 'Earth deity'],
      significance: 'Older than pyramids; massive stone working mystery; UNESCO site.'
    }
  }
];

export const PERSIAN_SITES: AncientLocation[] = [
  {
    id: 'susa',
    name: 'Susa',
    lat: 32.19,
    lng: 48.26,
    tier: 2,
    category: 'CITY',
    civilization: 'Elamite',
    dateRange: { start: 4200, end: 640 },
    modernName: 'Shush, Iran',
    lore: {
      history: 'Ancient Elamite capital, contemporary rival to Sumer. Later became Persian winter capital. Continuous habitation for 6000+ years.',
      mythology: [
        'Inshushinak, patron god of Susa ("Lord of Susa")',
        'Legendary city in Epic of Gilgamesh',
        'Site where Code of Hammurabi stele was found (as war loot)'
      ],
      deities: ['Inshushinak (Lord of Susa)', 'Humban (Sky god)', 'Kiririsha (Mother goddess)'],
      significance: 'Elamite civilization center; Indo-European and Semitic crossroads; Code of Hammurabi repository.'
    },
    sceneTarget: 'SUSA'
  },
  {
    id: 'jiroft',
    name: 'Jiroft',
    lat: 28.68,
    lng: 57.74,
    tier: 3,
    category: 'SETTLEMENT',
    civilization: 'Jiroft/Aratta',
    dateRange: { start: 3000, end: 2200 },
    modernName: 'Kerman Province, Iran',
    lore: {
      history: 'Recently discovered Bronze Age culture. Possibly legendary Aratta mentioned in Sumerian texts. Sophisticated chlorite carvings.',
      mythology: [
        'May be mythical Aratta, rival of Uruk in Sumerian epics',
        'Enmerkar and the Lord of Aratta (epic poem)',
        'Known for precious stones and expert craftsmen'
      ],
      deities: ['Unknown - pre-literate chlorite iconography'],
      significance: 'Possible Aratta; sophisticated Bronze Age culture; Sumerian trade partner.'
    }
  }
];

export const LEVANTINE_SITES: AncientLocation[] = [
  {
    id: 'jericho',
    name: 'Jericho',
    lat: 31.87,
    lng: 35.44,
    tier: 2,
    category: 'SETTLEMENT',
    civilization: 'Pre-Pottery Neolithic',
    dateRange: { start: 9600, end: 539 },
    modernName: 'West Bank, Palestine',
    lore: {
      history: 'One of the oldest continuously inhabited cities (~11,000 years). Massive stone tower (8000 BCE) predates agriculture. Plastered skull cult.',
      mythology: [
        'Biblical conquest by Joshua - walls fell to trumpet blast',
        'Ancestor worship - skulls plastered to look lifelike, kept in homes',
        'Tower possibly astronomical/ritual, not military'
      ],
      deities: ['Ancestor spirits', 'Unknown Neolithic deities', 'Canaanite gods (later)'],
      significance: 'Oldest city; pre-agricultural walls; plastered skull cult; Biblical Jericho.'
    },
    sceneTarget: 'JERICHO'
  },
  {
    id: 'ebla',
    name: 'Ebla',
    lat: 35.80,
    lng: 36.80,
    tier: 3,
    category: 'CITY',
    civilization: 'Eblaite',
    dateRange: { start: 3500, end: 1600 },
    modernName: 'Tell Mardikh, Syria',
    lore: {
      history: 'Powerful kingdom discovered in 1970s. Archive of 20,000 cuneiform tablets revealed a third great Bronze Age language (besides Sumerian/Akkadian).',
      mythology: [
        'Kura, chief deity of Ebla pantheon',
        'Syncretism with Mesopotamian gods',
        'Royal cult of dead kings'
      ],
      deities: ['Kura (Chief deity)', 'Ishtar/Ishara', 'Dagan/Dagon (grain)'],
      significance: 'Semitic rival to Mesopotamia; 20,000 tablet archive; third Bronze Age language.'
    }
  }
];

export const MEGALITHIC_SITES: AncientLocation[] = [
  {
    id: 'gobekli_tepe',
    name: 'Göbekli Tepe',
    lat: 37.22,
    lng: 38.92,
    tier: 2,
    category: 'MEGALITH',
    civilization: 'Pre-Pottery Neolithic',
    dateRange: { start: 9600, end: 8200 },
    modernName: 'Şanlıurfa, Turkey',
    lore: {
      history: 'World\'s oldest known temple complex, built 6000 years before Stonehenge by hunter-gatherers. Massive T-shaped pillars carved with animals predate agriculture and writing.',
      mythology: [
        'Carved animals may represent totemic spirits or constellation symbols',
        'Vulture imagery suggests excarnation rituals (exposure of dead)',
        'Central pillars possibly represent anthropomorphic gods or ancestors',
        'Deliberately buried around 8000 BCE for unknown ritual reasons'
      ],
      deities: ['Vulture/Death spirit', 'Animal totems (Lion, Fox, Boar, Snake)', 'Sky beings'],
      significance: 'Oldest religious architecture; suggests organized religion predates agriculture.'
    },
    sceneTarget: 'GOBEKLI_TEPE'
  },
  {
    id: 'hagar_qim',
    name: 'Ħaġar Qim',
    lat: 35.83,
    lng: 14.44,
    tier: 2,
    category: 'MEGALITH',
    civilization: 'Maltese Neolithic',
    dateRange: { start: 3600, end: 2500 },
    modernName: 'Malta',
    lore: {
      history: 'Megalithic temple complex with precise astronomical alignments. During equinoxes, sunlight illuminates specific altar stones through doorway apertures.',
      mythology: [
        'Venus figurines suggest worship of a fat goddess of fertility',
        'Underground oracle chambers for prophetesses',
        'Astronomical alignments track solar and lunar cycles',
        'Sacrificial altars with animal bone deposits'
      ],
      deities: ['Fat Lady/Mother Goddess (fertility)', 'Sun deity', 'Moon deity'],
      significance: 'Sophisticated astronomical observatory-temple; evidence of oracle priestesses.'
    },
    sceneTarget: 'HAGAR_QIM'
  },
  {
    id: 'stonehenge',
    name: 'Stonehenge',
    lat: 51.18,
    lng: -1.83,
    tier: 2,
    category: 'MEGALITH',
    civilization: 'Neolithic Britain',
    dateRange: { start: 3000, end: 1600 },
    modernName: 'Wiltshire, England',
    lore: {
      history: 'Iconic stone circle built in multiple phases over 1500 years. Bluestones transported 150 miles from Wales using unknown methods. Precise summer solstice alignment.',
      mythology: [
        'Merlin supposedly transported stones from Ireland using magic',
        'Giants\' Dance - legend says giants built it as a healing temple',
        'Druidic tradition (much later) claims it as ritual sacrifice site',
        'Possible ancestor worship and cremation necropolis'
      ],
      deities: ['Sun deity', 'Moon deity', 'Ancestors/Giants'],
      significance: 'Engineering marvel of Neolithic Europe; astronomical calendar and sacred cremation ground.'
    },
    sceneTarget: 'STONEHENGE'
  }
];

export const CHINESE_SITES: AncientLocation[] = [
  {
    id: 'banpo',
    name: 'Banpo Village',
    lat: 34.27,
    lng: 109.08,
    tier: 2,
    category: 'SETTLEMENT',
    civilization: 'Yangshao',
    dateRange: { start: 4500, end: 3750 },
    modernName: 'Xi\'an, China',
    lore: {
      history: 'Neolithic village along the Yellow River, one of the best-preserved Yangshao culture sites. Pottery decorated with fish and human-face motifs.',
      mythology: [
        'Fish-faced pottery may represent solar or shamanic symbolism',
        'Dragon imagery on ceramics suggests early dragon worship',
        'Burial orientation (head to west) implies belief in rebirth from sunset',
        'Communal ritual spaces indicate shamanistic practices'
      ],
      deities: ['Dragon spirit', 'Ancestor spirits', 'Fish/Sun deity'],
      significance: 'Early evidence of Chinese cosmology; origin of dragon and fish mythology in China.'
    },
    sceneTarget: 'BANPO'
  }
];

// ============================================================================
// TIER 3: MINOR SETTLEMENTS & WAYPOINTS (Trade Routes)
// ============================================================================

export const TRADE_ROUTE_WAYPOINTS: AncientLocation[] = [
  {
    id: 'ugarit',
    name: 'Ugarit',
    lat: 35.60,
    lng: 35.78,
    tier: 3,
    category: 'CITY',
    civilization: 'Ugaritic',
    dateRange: { start: 4000, end: 1185 },
    modernName: 'Ras Shamra, Syria',
    lore: {
      history: 'Cosmopolitan port city. Invented cuneiform alphabet (precursor to Phoenician). Baal Cycle myths preserved here.',
      mythology: [
        'Baal (storm god) vs Mot (death god) endless cycle',
        'El presides over divine council',
        'Anat, fierce goddess of war and hunting'
      ],
      deities: ['Baal (Storm)', 'El (Father)', 'Asherah (Mother)', 'Mot (Death)', 'Anat (War)'],
      significance: 'Alphabet innovation; Baal Cycle; trade hub; Bronze Age collapse victim.'
    }
  },
  {
    id: 'tell_brak',
    name: 'Tell Brak',
    lat: 36.70,
    lng: 41.05,
    tier: 3,
    category: 'SETTLEMENT',
    civilization: 'Mesopotamian',
    dateRange: { start: 6000, end: 2000 },
    modernName: 'Syria',
    lore: {
      history: 'Northern Mesopotamian hub on trade routes. "Eye Temple" filled with thousands of eye idols.',
      mythology: [
        'Eye idols - votive offerings or protection from evil eye',
        'Gaze of the gods watching over travelers',
        'Waystation for merchants praying for safe passage'
      ],
      deities: ['Eye god (unknown name)', 'Various protective spirits'],
      significance: 'Trade route nexus; thousands of eye idols; northern Mesopotamian culture.'
    }
  },
  {
    id: 'tall_hamoukar',
    name: 'Tall Hamoukar',
    lat: 36.70,
    lng: 41.60,
    tier: 3,
    category: 'SETTLEMENT',
    civilization: 'Mesopotamian',
    dateRange: { start: 4000, end: 2200 },
    modernName: 'Syria',
    lore: {
      history: 'Evidence of oldest known war (~3500 BCE). Mass grave and destroyed walls from Uruk expansion.',
      mythology: [
        'Conquest by Uruk forces spreading civilization north',
        'Warriors fell defending their city from southern invaders'
      ],
      deities: ['Local protective deities (lost to history)'],
      significance: 'Earliest warfare evidence; Uruk expansion victim; northern resistance.'
    }
  },
  {
    id: 'sialk',
    name: 'Tepe Sialk',
    lat: 33.96,
    lng: 51.47,
    tier: 3,
    category: 'SETTLEMENT',
    civilization: 'Proto-Elamite',
    dateRange: { start: 6000, end: 1000 },
    modernName: 'Kashan, Iran',
    lore: {
      history: 'One of Iran\'s oldest settlements. Developed early proto-writing (proto-Elamite script, undeciphered).',
      mythology: [
        'Ziggurat suggests Elamite religious practices',
        'Mother goddess worship evident from figurines'
      ],
      deities: ['Mother goddess', 'Sky deity', 'Elamite pantheon influences'],
      significance: 'Early Iranian civilization; proto-Elamite script; Mesopotamian-Iranian bridge.'
    }
  },
  {
    id: 'ain_ghazal',
    name: 'Ain Ghazal',
    lat: 32.01,
    lng: 35.95,
    tier: 3,
    category: 'SETTLEMENT',
    civilization: 'Pre-Pottery Neolithic',
    dateRange: { start: 7250, end: 5000 },
    modernName: 'Jordan',
    lore: {
      history: 'One of largest Neolithic sites. Famous for lime plaster statues with painted eyes - earliest large-scale human statuary.',
      mythology: [
        'Two-headed plaster statues suggest supernatural beings',
        'Figures possibly represent ancestors or deities',
        'Ritual burial of statues in pits'
      ],
      deities: ['Ancestor spirits', 'Twin deities?', 'Fertility goddess'],
      significance: 'Largest Neolithic village; earliest large human statues; Jordan River valley culture.'
    }
  },
  {
    id: 'mehrgarh',
    name: 'Mehrgarh',
    lat: 29.38,
    lng: 67.63,
    tier: 3,
    category: 'SETTLEMENT',
    civilization: 'Pre-Indus',
    dateRange: { start: 7000, end: 2600 },
    modernName: 'Balochistan, Pakistan',
    lore: {
      history: 'Precursor to Indus Valley Civilization. Evidence of dentistry (~7000 BCE), earliest wheat/barley farming in South Asia.',
      mythology: [
        'Mother goddess figurines indicate fertility cult',
        'Cattle domestication - origin of sacred cow?',
        'Burial practices suggest belief in afterlife'
      ],
      deities: ['Mother Goddess (proto-Indus)', 'Bull deity (precursor to Shiva?)'],
      significance: 'Precursor to Indus Valley; earliest South Asian agriculture; proto-dentistry!'
    }
  }
];

export const CENTRAL_ASIAN_SITES: AncientLocation[] = [
  {
    id: 'gonur_tepe',
    name: 'Gonur Tepe',
    lat: 38.58,
    lng: 62.15,
    tier: 3,
    category: 'SETTLEMENT',
    civilization: 'Bactria-Margiana',
    dateRange: { start: 2400, end: 1600 },
    modernName: 'Turkmenistan',
    lore: {
      history: 'Capital of mysterious BMAC (Bactria-Margiana Archaeological Complex). Bronze Age Central Asian culture connecting East and West.',
      mythology: [
        'Possible origin of Zoroastrianism concepts',
        'Fire altars suggest fire worship',
        'Haoma/Soma ritual drink production'
      ],
      deities: ['Fire deity', 'Sky god', 'Unknown BMAC pantheon'],
      significance: 'Central Asian Bronze Age culture; East-West trade link; possible Indo-Iranian homeland.'
    }
  }
];

export const AFRICAN_SITES: AncientLocation[] = [
  {
    id: 'kerma',
    name: 'Kerma',
    lat: 19.61,
    lng: 30.42,
    tier: 3,
    category: 'CITY',
    civilization: 'Kushite',
    dateRange: { start: 2500, end: 1500 },
    modernName: 'Sudan',
    lore: {
      history: 'Capital of Kingdom of Kush, rival to Egypt. Massive deffufas (mud-brick temples). Buried kings with hundreds of sacrificed retainers.',
      mythology: [
        'Death pits similar to Ur - royal retinue followed king to afterlife',
        'Syncretism with Egyptian gods (Amun becomes chief deity)',
        'Unique Nubian pottery and burial customs'
      ],
      deities: ['Amun (later)', 'Kushite deities (names lost)', 'Apedemak (lion god, later)'],
      significance: 'First Kushite capital; Egyptian rival; massive death pit sacrifices.'
    }
  }
];

// Update existing arrays
export const MINOR_SITES: AncientLocation[] = [
  {
    id: 'caral',
    name: 'Caral-Supe',
    lat: -10.89,
    lng: -77.52,
    tier: 3,
    category: 'CITY',
    civilization: 'Norte Chico',
    dateRange: { start: 3000, end: 1800 },
    modernName: 'Peru',
    lore: {
      history: 'Oldest known city in the Americas, contemporary with Egyptian pyramids. Featured large platform mounds and circular plazas for public ceremonies.',
      mythology: [
        'Large amphitheaters suggest communal ritual performances',
        'Quipu (knotted strings) may have recorded religious observations',
        'No evidence of warfare; possibly a peaceful theocratic culture',
        'Astronomical orientations in architecture'
      ],
      deities: ['Mountain spirits', 'Ocean deities', 'Ancestor worship'],
      significance: 'Oldest American civilization; demonstrates independent development of complex society.'
    },
    sceneTarget: 'CARAL'
  },
  ...TRADE_ROUTE_WAYPOINTS,
  ...CENTRAL_ASIAN_SITES,
  ...AFRICAN_SITES
];

// ============================================================================
// COMBINED ARRAYS
// ============================================================================

export const ALL_ANCIENT_LOCATIONS: AncientLocation[] = [
  ...MESOPOTAMIAN_CITIES,
  ...MESOPOTAMIAN_TIER2,
  ...EGYPTIAN_SITES,
  ...EGYPTIAN_TIER2,
  ...INDUS_VALLEY_SITES,
  ...MEGALITHIC_SITES,
  ...ANATOLIAN_SITES,
  ...MEDITERRANEAN_TIER2,
  ...PERSIAN_SITES,
  ...LEVANTINE_SITES,
  ...CHINESE_SITES,
  ...MINOR_SITES
];

export const TIER_1_LOCATIONS = ALL_ANCIENT_LOCATIONS.filter(loc => loc.tier === 1);
export const TIER_2_LOCATIONS = ALL_ANCIENT_LOCATIONS.filter(loc => loc.tier === 2);
export const TIER_3_LOCATIONS = ALL_ANCIENT_LOCATIONS.filter(loc => loc.tier === 3);

// Helper function to get location by ID
export function getLocationById(id: string): AncientLocation | undefined {
  return ALL_ANCIENT_LOCATIONS.find(loc => loc.id === id);
}

// Helper function to get locations by civilization
export function getLocationsByCivilization(civilization: string): AncientLocation[] {
  return ALL_ANCIENT_LOCATIONS.filter(loc => loc.civilization === civilization);
}

// Helper function to check if location visible at zoom level (LOD)
export function isLocationVisible(location: AncientLocation, zoomLevel: number): boolean {
  // Tier 1: Always visible
  if (location.tier === 1) return true;
  
  // Tier 2: Visible when zoomed to region (medium zoom)
  if (location.tier === 2) return zoomLevel >= 3;
  
  // Tier 3: Only visible when closely zoomed
  if (location.tier === 3) return zoomLevel >= 5;
  
  return false;
}

// Helper to get nearby locations (for route planning)
export function getNearbyLocations(lat: number, lng: number, radiusDegrees: number = 5): AncientLocation[] {
  return ALL_ANCIENT_LOCATIONS.filter(loc => {
    const latDiff = Math.abs(loc.lat - lat);
    const lngDiff = Math.abs(loc.lng - lng);
    const distance = Math.sqrt(latDiff**2 + lngDiff**2);
    return distance <= radiusDegrees;
  });
}

