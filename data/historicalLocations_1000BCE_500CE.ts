import { GlobeMarker, SceneType } from '../types';

/**
 * Comprehensive Historical Locations Database
 * Timeline: 1000 BCE - 500 CE (Dark Ages)
 * 
 * Zoom Levels:
 * - 1 = Major Hubs (Capital cities, major temples, god boss arenas)
 * - 2 = Sub-Locations (Villages, resource zones, minor dungeons)
 * - 3 = Micro Content (Camps, caves, quest NPCs, training spots)
 */

export const HISTORICAL_LOCATIONS_1000BCE_500CE: GlobeMarker[] = [
    // ========== MEDITERRANEAN & MIDDLE EAST ==========

    // --- EGYPT (Major Hub) ---
    {
        id: 'egypt_giza',
        lat: 29.9792,
        lng: 31.1342,
        type: 'ANCIENT_SITE',
        label: 'GIZA PYRAMIDS',
        eraRequired: 0,
        sceneTarget: 'EGYPT',
        icon: '🔺',
        zoomLevel: 1,
        hasBank: true,
        shopType: 'GENERAL'
    },
    {
        id: 'egypt_luxor',
        lat: 25.6872,
        lng: 32.6396,
        type: 'ANCIENT_SITE',
        label: 'LUXOR TEMPLE (Karnak)',
        eraRequired: 0,
        icon: '⛩️',
        zoomLevel: 1
    },
    {
        id: 'egypt_alexandria',
        lat: 31.2001,
        lng: 29.9187,
        type: 'CITY',
        label: 'ALEXANDRIA (331 BCE)',
        eraRequired: 0,
        icon: '🏛️',
        zoomLevel: 1,
        hasBank: true,
        shopType: 'GENERAL'
    },
    {
        id: 'egypt_valley_kings',
        lat: 25.7402,
        lng: 32.6014,
        type: 'DUNGEON',
        label: 'Valley of the Kings (Tombs)',
        eraRequired: 0,
        icon: '⚰️',
        zoomLevel: 2
    },
    {
        id: 'egypt_nile_fishing',
        lat: 26.5,
        lng: 31.8,
        type: 'RESOURCE',
        label: 'Nile Fishing Spot',
        eraRequired: 0,
        icon: '🐟',
        zoomLevel: 3,
        discoverable: true
    },

    // --- MESOPOTAMIA ---
    {
        id: 'babylon',
        lat: 32.5355,
        lng: 44.4275,
        type: 'CITY',
        label: 'BABYLON (Hanging Gardens)',
        eraRequired: 0,
        icon: '🏛️',
        zoomLevel: 1,
        hasBank: true,
        shopType: 'GENERAL'
    },
    {
        id: 'ur_ziggurat',
        lat: 30.9625,
        lng: 46.1030,
        type: 'ANCIENT_SITE',
        label: 'UR ZIGGURAT',
        eraRequired: 0,
        icon: '🗼',
        zoomLevel: 2
    },
    {
        id: 'nineveh',
        lat: 36.3489,
        lng: 43.1520,
        type: 'CITY',
        label: 'NINEVEH (Assyrian Capital)',
        eraRequired: 0,
        icon: '🏛️',
        zoomLevel: 1,
        hasBank: true
    },

    // --- PERSIA ---
    {
        id: 'persepolis',
        lat: 29.9353,
        lng: 52.8916,
        type: 'CITY',
        label: 'PERSEPOLIS (515 BCE)',
        eraRequired: 0,
        icon: '🏛️',
        zoomLevel: 1,
        hasBank: true,
        shopType: 'GENERAL'
    },
    {
        id: 'pasargadae',
        lat: 30.1957,
        lng: 53.1669,
        type: 'ANCIENT_SITE',
        label: 'Pasargadae (Cyrus Tomb)',
        eraRequired: 0,
        icon: '⚰️',
        zoomLevel: 2
    },

    // --- LEVANT / HOLY LAND ---
    {
        id: 'jerusalem',
        lat: 31.7683,
        lng: 35.2137,
        type: 'CITY',
        label: "JERUSALEM (Solomon's Temple)",
        eraRequired: 0,
        icon: '⛩️',
        zoomLevel: 1,
        hasBank: true,
        shopType: 'GENERAL'
    },
    {
        id: 'petra',
        lat: 30.3285,
        lng: 35.4444,
        type: 'ANCIENT_SITE',
        label: 'PETRA (Nabataean City)',
        eraRequired: 0,
        icon: '🗿',
        zoomLevel: 1
    },
    {
        id: 'tyre',
        lat: 33.2704,
        lng: 35.1938,
        type: 'CITY',
        label: 'TYRE (Phoenician Port)',
        eraRequired: 0,
        icon: '⛵',
        zoomLevel: 2,
        shopType: 'LOCAL'
    },

    // --- GREECE (Classical Era Major Content) ---
    {
        id: 'athens',
        lat: 37.9838,
        lng: 23.7275,
        type: 'CITY',
        label: 'ATHENS (Parthenon)',
        eraRequired: 0,
        sceneTarget: 'MEDIEVAL_KINGDOM',
        icon: '🏛️',
        zoomLevel: 1,
        hasBank: true,
        shopType: 'GENERAL'
    },
    {
        id: 'sparta',
        lat: 37.0810,
        lng: 22.4230,
        type: 'CITY',
        label: 'SPARTA (Warrior City)',
        eraRequired: 0,
        icon: '⚔️',
        zoomLevel: 1,
        hasBank: true
    },
    {
        id: 'delphi',
        lat: 38.4824,
        lng: 22.5010,
        type: 'ANCIENT_SITE',
        label: 'DELPHI ORACLE',
        eraRequired: 0,
        icon: '🔮',
        zoomLevel: 1
    },
    {
        id: 'olympia',
        lat: 37.6379,
        lng: 21.6300,
        type: 'ANCIENT_SITE',
        label: 'OLYMPIA (Games)',
        eraRequired: 0,
        icon: '🏟️',
        zoomLevel: 1
    },
    {
        id: 'mount_olympus',
        lat: 40.0858,
        lng: 22.3583,
        type: 'DUNGEON',
        label: 'MOUNT OLYMPUS (Zeus Domain)',
        eraRequired: 0,
        icon: '⛰️',
        zoomLevel: 1
    },
    {
        id: 'crete_knossos',
        lat: 35.2980,
        lng: 25.1633,
        type: 'ANCIENT_SITE',
        label: 'KNOSSOS (Minoan Palace)',
        eraRequired: 0,
        icon: '🏛️',
        zoomLevel: 2
    },
    {
        id: 'troy',
        lat: 39.9577,
        lng: 26.2396,
        type: 'ANCIENT_SITE',
        label: 'TROY (Trojan War)',
        eraRequired: 0,
        icon: '🏰',
        zoomLevel: 1
    },

    // --- ROME (Classical to Dark Ages) ---
    {
        id: 'rome',
        lat: 41.9028,
        lng: 12.4964,
        type: 'CITY',
        label: 'ROME (753 BCE - Capital)',
        eraRequired: 0,
        sceneTarget: 'ROME',
        icon: '🏛️',
        zoomLevel: 1,
        hasBank: true,
        shopType: 'GENERAL'
    },
    {
        id: 'pompeii',
        lat: 40.7510,
        lng: 14.4903,
        type: 'ANCIENT_SITE',
        label: 'POMPEII (79 CE Eruption)',
        eraRequired: 0,
        icon: '🌋',
        zoomLevel: 2
    },
    {
        id: 'carthage',
        lat: 36.8525,
        lng: 10.3233,
        type: 'CITY',
        label: 'CARTHAGE (814 BCE - Punic Wars)',
        eraRequired: 0,
        icon: '🏛️',
        zoomLevel: 1,
        hasBank: true,
        shopType: 'GENERAL'
    },

    // ========== EUROPE ==========

    // --- BRITAIN (Celtic to Dark Ages) ---
    {
        id: 'stonehenge',
        lat: 51.1789,
        lng: -1.8262,
        type: 'ANCIENT_SITE',
        label: 'STONEHENGE (Megalith)',
        eraRequired: 0,
        icon: '🗿',
        zoomLevel: 1
    },
    {
        id: 'camelot_britain',
        lat: 51.0,
        lng: -2.5,
        type: 'CITY',
        label: 'CAMELOT (Arthurian Legend ~500 CE)',
        eraRequired: 0,
        sceneTarget: 'MEDIEVAL_KINGDOM',
        icon: '🏰',
        zoomLevel: 1,
        hasBank: true,
        shopType: 'GENERAL'
    },
    {
        id: 'hadrians_wall',
        lat: 55.0244,
        lng: -2.7913,
        type: 'ANCIENT_SITE',
        label: "HADRIAN'S WALL (122 CE)",
        eraRequired: 0,
        icon: '🧱',
        zoomLevel: 2
    },
    {
        id: 'bath_aquae_sulis',
        lat: 51.3811,
        lng: -2.3590,
        type: 'CITY',
        label: 'BATH (Aquae Sulis - Roman Baths)',
        eraRequired: 0,
        icon: '♨️',
        zoomLevel: 2,
        shopType: 'LOCAL'
    },

    // --- GAUL / FRANCE ---
    {
        id: 'alesia',
        lat: 47.5377,
        lng: 4.5013,
        type: 'ANCIENT_SITE',
        label: 'ALESIA (52 BCE - Caesar vs Gauls)',
        eraRequired: 0,
        icon: '⚔️',
        zoomLevel: 2
    },
    {
        id: 'paris_lutetia',
        lat: 48.8566,
        lng: 2.3522,
        type: 'CITY',
        label: 'LUTETIA (Paris - Gaulish Settlement)',
        eraRequired: 0,
        icon: '🏘️',
        zoomLevel: 2,
        shopType: 'LOCAL'
    },

    // --- SCANDINAVIA (Tutorial Island Region) ---
    {
        id: 'tutorial_island',
        lat: 60.0,
        lng: 10.0,
        type: 'CITY',
        label: 'ORIGIN POINT (Ice Age Tundra)',
        eraRequired: 0,
        sceneTarget: 'TUTORIAL_ISLAND',
        icon: '🏕️',
        zoomLevel: 1,
        hasBank: true
    },
    {
        id: 'scandinavia_forest',
        lat: 62.0,
        lng: 15.0,
        type: 'RESOURCE',
        label: 'Northern Pine Forest',
        eraRequired: 0,
        icon: '🌲',
        zoomLevel: 2,
        discoverable: true
    },
    {
        id: 'scandinavia_mountains',
        lat: 65.0,
        lng: 12.0,
        type: 'RESOURCE',
        label: 'Scandinavian Ore Veins',
        eraRequired: 0,
        icon: '⛏️',
        zoomLevel: 3,
        discoverable: true
    },

    // ========== ASIA ==========

    // --- CHINA (Han Dynasty) ---
    {
        id: 'changan',
        lat: 34.3416,
        lng: 108.9398,
        type: 'CITY',
        label: "CHANG'AN (Han Capital - 202 BCE)",
        eraRequired: 0,
        sceneTarget: 'ASIA',
        icon: '🏛️',
        zoomLevel: 1,
        hasBank: true,
        shopType: 'GENERAL'
    },
    {
        id: 'great_wall',
        lat: 40.4319,
        lng: 116.5704,
        type: 'ANCIENT_SITE',
        label: 'GREAT WALL (Construction Sites)',
        eraRequired: 0,
        icon: '🧱',
        zoomLevel: 1
    },
    {
        id: 'luoyang',
        lat: 34.6197,
        lng: 112.4540,
        type: 'CITY',
        label: 'LUOYANG (Eastern Han Capital)',
        eraRequired: 0,
        icon: '🏛️',
        zoomLevel: 1,
        hasBank: true,
        shopType: 'GENERAL'
    },
    {
        id: 'terracotta_army',
        lat: 34.3848,
        lng: 109.2789,
        type: 'ANCIENT_SITE',
        label: 'TERRACOTTA ARMY (Qin Tomb)',
        eraRequired: 0,
        icon: '🗿',
        zoomLevel: 1
    },
    {
        id: 'silk_road_dunhuang',
        lat: 40.1424,
        lng: 94.6617,
        type: 'CITY',
        label: 'DUNHUANG (Silk Road Oasis)',
        eraRequired: 0,
        icon: '🏜️',
        zoomLevel: 2,
        shopType: 'LOCAL'
    },

    // --- INDIA ---
    {
        id: 'taxila',
        lat: 33.7489,
        lng: 72.8333,
        type: 'CITY',
        label: 'TAXILA (Buddhist Learning Center)',
        eraRequired: 0,
        icon: '⛩️',
        zoomLevel: 1,
        hasBank: true
    },
    {
        id: 'nalanda',
        lat: 25.1358,
        lng: 85.4440,
        type: 'ANCIENT_SITE',
        label: 'NALANDA MONASTERY',
        eraRequired: 0,
        icon: '⛩️',
        zoomLevel: 2
    },
    {
        id: 'sanchi_stupa',
        lat: 23.4795,
        lng: 77.7396,
        type: 'ANCIENT_SITE',
        label: 'SANCHI STUPA',
        eraRequired: 0,
        icon: '⛩️',
        zoomLevel: 2
    },

    // --- JAPAN (Early Yayoi Period ~300 BCE) ---
    {
        id: 'yoshinogari',
        lat: 33.3142,
        lng: 130.4167,
        type: 'ANCIENT_SITE',
        label: 'YOSHINOGARI (Yayoi Settlement)',
        eraRequired: 0,
        icon: '🏘️',
        zoomLevel: 2
    },

    // ========== AMERICAS ==========

    // --- MESOAMERICA (Maya) ---
    {
        id: 'teotihuacan',
        lat: 19.6925,
        lng: -98.8438,
        type: 'CITY',
        label: 'TEOTIHUACAN (100 BCE - Pyramids)',
        eraRequired: 0,
        sceneTarget: 'AMERICAS',
        icon: '🔺',
        zoomLevel: 1,
        hasBank: true,
        shopType: 'GENERAL'
    },
    {
        id: 'tikal',
        lat: 17.2221,
        lng: -89.6236,
        type: 'CITY',
        label: 'TIKAL (Maya City 200 BCE)',
        eraRequired: 0,
        icon: '🏛️',
        zoomLevel: 1,
        hasBank: true
    },
    {
        id: 'chichen_itza',
        lat: 20.6843,
        lng: -88.5678,
        type: 'ANCIENT_SITE',
        label: 'CHICHEN ITZA (Maya)',
        eraRequired: 0,
        icon: '🔺',
        zoomLevel: 1
    },
    {
        id: 'palenque',
        lat: 17.4858,
        lng: -92.0469,
        type: 'ANCIENT_SITE',
        label: 'PALENQUE (Maya Temple)',
        eraRequired: 0,
        icon: '⛩️',
        zoomLevel: 2
    },

    // --- PERU (Nazca, Pre-Inca) ---
    {
        id: 'nazca_lines',
        lat: -14.7390,
        lng: -75.1300,
        type: 'ANCIENT_SITE',
        label: 'NAZCA LINES (500 BCE - 500 CE)',
        eraRequired: 0,
        icon: '🦅',
        zoomLevel: 1
    },
    {
        id: 'chavin_de_huantar',
        lat: -9.5944,
        lng: -77.1772,
        type: 'ANCIENT_SITE',
        label: 'CHAVIN DE HUANTAR (Temple)',
        eraRequired: 0,
        icon: '⛩️',
        zoomLevel: 2
    },

    // --- NORTH AMERICA ---
    {
        id: 'poverty_point',
        lat: 32.6379,
        lng: -91.4084,
        type: 'ANCIENT_SITE',
        label: 'POVERTY POINT (Earthworks 1650 BCE)',
        eraRequired: 0,
        icon: '🗿',
        zoomLevel: 2
    },
    {
        id: 'rocky_mountains_region',
        lat: 40.0,
        lng: -105.0,
        type: 'RESOURCE',
        label: 'ROCKY MOUNTAINS (Thunderbird Domain)',
        eraRequired: 0,
        sceneTarget: 'NORTH',
        icon: '⛰️',
        zoomLevel: 1
    },

    // ========== AFRICA ==========

    // --- NUBIA / KUSH ---
    {
        id: 'meroe',
        lat: 16.9375,
        lng: 33.7481,
        type: 'CITY',
        label: 'MEROE (Kingdom of Kush)',
        eraRequired: 0,
        icon: '🔺',
        zoomLevel: 1,
        hasBank: true
    },
    {
        id: 'napata',
        lat: 18.5333,
        lng: 31.8333,
        type: 'ANCIENT_SITE',
        label: 'NAPATA (Kushite Capital)',
        eraRequired: 0,
        icon: '🏛️',
        zoomLevel: 2
    },

    // --- ETHIOPIA ---
    {
        id: 'axum',
        lat: 14.1250,
        lng: 38.7167,
        type: 'CITY',
        label: 'AXUM (Kingdom ~100 CE)',
        eraRequired: 0,
        icon: '🗿',
        zoomLevel: 1,
        hasBank: true
    },

    // ========== MYTHICAL / OCEAN ==========

    {
        id: 'atlantis',
        lat: 36.0,
        lng: -25.0,
        type: 'DUNGEON',
        label: 'SUNKEN ATLANTIS (Poseidon Domain)',
        eraRequired: 0,
        sceneTarget: 'CELESTIAL_REALM',
        icon: '🌊',
        zoomLevel: 1
    }
];

/**
 * Sub-Location Generator (Procedural)
 * 
 * For every major hub, generate nearby sub-locations:
 * - Resource zones: +/- 0.5° lat/lng (50-100km radius)
 * - Villages: +/- 0.3° (30-50km)
 * - Caves/dungeons: +/- 0.2° (20-30km)
 */
export function generateSubLocationsNearHub(hub: GlobeMarker): GlobeMarker[] {
    const subLocations: GlobeMarker[] = [];

    // 4 resource zones around hub (N, S, E, W)
    const resourceOffsets = [
        { lat: 0.3, lng: 0, suffix: 'North' },
        { lat: -0.3, lng: 0, suffix: 'South' },
        { lat: 0, lng: 0.3, suffix: 'East' },
        { lat: 0, lng: -0.3, suffix: 'West' }
    ];

    resourceOffsets.forEach((offset, i) => {
        subLocations.push({
            id: `${hub.id}_resource_${i}`,
            lat: hub.lat + offset.lat,
            lng: hub.lng + offset.lng,
            type: 'RESOURCE',
            label: `${offset.suffix} ${hub.label.split(' ')[0]} Woodlands`,
            eraRequired: hub.eraRequired,
            icon: '🌲',
            zoomLevel: 3,
            discoverable: true
        });
    });

    // 2 villages
    subLocations.push(
        {
            id: `${hub.id}_village_1`,
            lat: hub.lat + 0.15,
            lng: hub.lng + 0.15,
            type: 'CITY',
            label: `${hub.label.split(' ')[0]} Outpost`,
            eraRequired: hub.eraRequired,
            icon: '🏘️',
            zoomLevel: 2,
            shopType: 'LOCAL'
        },
        {
            id: `${hub.id}_village_2`,
            lat: hub.lat - 0.15,
            lng: hub.lng - 0.15,
            type: 'CITY',
            label: `${hub.label.split(' ')[0]} Settlement`,
            eraRequired: hub.eraRequired,
            icon: '🏘️',
            zoomLevel: 2,
            shopType: 'LOCAL'
        }
    );

    // 1 cave dungeon
    subLocations.push({
        id: `${hub.id}_cave`,
        lat: hub.lat + 0.1,
        lng: hub.lng - 0.1,
        type: 'DUNGEON',
        label: `${hub.label.split(' ')[0]} Cave`,
        eraRequired: hub.eraRequired,
        icon: '🕳️',
        zoomLevel: 3,
        discoverable: true
    });

    return subLocations;
}

// Generate all sub-locations for major hubs (zoom level 1)
export const ALL_LOCATIONS_WITH_SUBS = [
    ...HISTORICAL_LOCATIONS_1000BCE_500CE,
    ...HISTORICAL_LOCATIONS_1000BCE_500CE
        .filter(loc => loc.zoomLevel === 1)
        .flatMap(hub => generateSubLocationsNearHub(hub))
];
