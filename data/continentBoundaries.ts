export const CONTINENT_BOUNDARIES: Record<string, { lat: number; lng: number }[]> = {
    africa: [
        { lat: 37, lng: 10 }, { lat: 30, lng: 32 }, { lat: 15, lng: 50 }, { lat: -10, lng: 50 },
        { lat: -35, lng: 35 }, { lat: -35, lng: 20 }, { lat: -20, lng: 10 }, { lat: 10, lng: -15 },
        { lat: 30, lng: -17 }
    ],
    asia: [
        { lat: 70, lng: 40 }, { lat: 70, lng: 180 }, { lat: 50, lng: 145 }, { lat: 25, lng: 120 },
        { lat: 10, lng: 100 }, { lat: 0, lng: 100 }, { lat: 10, lng: 70 }, { lat: 20, lng: 60 },
        { lat: 40, lng: 40 }, { lat: 50, lng: 50 }
    ],
    europe: [
        { lat: 70, lng: -10 }, { lat: 70, lng: 40 }, { lat: 60, lng: 60 }, { lat: 50, lng: 50 },
        { lat: 42, lng: -9 }, { lat: 50, lng: -5 }, { lat: 55, lng: 5 }, { lat: 60, lng: 5 }
    ],
    northAmerica: [
        { lat: 70, lng: -160 }, { lat: 70, lng: -70 }, { lat: 60, lng: -60 }, { lat: 50, lng: -55 },
        { lat: 30, lng: -80 }, { lat: 25, lng: -80 }, { lat: 15, lng: -90 }, { lat: 8, lng: -80 },
        { lat: 8, lng: -77 }, { lat: 18, lng: -100 }, { lat: 30, lng: -115 }, { lat: 50, lng: -130 },
        { lat: 60, lng: -140 }
    ],
    southAmerica: [
        { lat: 12, lng: -75 }, { lat: 10, lng: -60 }, { lat: -5, lng: -35 }, { lat: -20, lng: -40 },
        { lat: -40, lng: -60 }, { lat: -55, lng: -65 }, { lat: -50, lng: -75 }, { lat: -20, lng: -70 },
        { lat: -5, lng: -80 }
    ],
    australia: [
        { lat: -11, lng: 142 }, { lat: -11, lng: 130 }, { lat: -20, lng: 115 }, { lat: -35, lng: 115 },
        { lat: -38, lng: 145 }, { lat: -30, lng: 153 }, { lat: -25, lng: 153 }
    ],
    greenland: [
        { lat: 83, lng: -40 }, { lat: 80, lng: -20 }, { lat: 70, lng: -20 }, { lat: 60, lng: -43 },
        { lat: 70, lng: -60 }, { lat: 80, lng: -60 }
    ],
    uk: [
        { lat: 58, lng: -6 }, { lat: 58, lng: 0 }, { lat: 50, lng: 0 }, { lat: 50, lng: -6 }
    ],
    japan: [
        { lat: 45, lng: 140 }, { lat: 45, lng: 145 }, { lat: 30, lng: 130 }, { lat: 35, lng: 130 }
    ],
    madagascar: [
        { lat: -12, lng: 49 }, { lat: -12, lng: 50 }, { lat: -25, lng: 45 }, { lat: -25, lng: 43 }
    ],
    indonesia: [ // Sumatra, Java, Borneo, Sulawesi
        { lat: 6, lng: 95 }, { lat: 7, lng: 117 }, { lat: 2, lng: 125 },
        { lat: -5, lng: 120 }, { lat: -10, lng: 125 }, { lat: -9, lng: 110 },
        { lat: -6, lng: 105 }
    ],
    newGuinea: [
        { lat: -1, lng: 130 }, { lat: 0, lng: 135 }, { lat: -3, lng: 142 },
        { lat: -10, lng: 150 }, { lat: -9, lng: 141 }, { lat: -5, lng: 137 }
    ],
    newZealand: [
        { lat: -34, lng: 172 }, { lat: -34, lng: 178 }, { lat: -47, lng: 167 }, { lat: -45, lng: 166 }
    ],
    tutorialIsland: [ // Eastern Mediterranean, near Egypt
        { lat: 33, lng: 32 }, { lat: 33, lng: 34 }, { lat: 31, lng: 34 }, { lat: 31, lng: 32 }
    ],
    italy: [ // Italian Peninsula
        { lat: 47, lng: 7 }, { lat: 46, lng: 13 }, { lat: 40, lng: 18 },
        { lat: 37, lng: 15 }, { lat: 38, lng: 9 }, { lat: 44, lng: 8 }
    ],
    greece: [ // Greece & Balkans
        { lat: 42, lng: 19 }, { lat: 41, lng: 25 }, { lat: 35, lng: 27 },
        { lat: 35, lng: 23 }, { lat: 38, lng: 20 }
    ],
    iberia: [ // Spain & Portugal
        { lat: 43, lng: -9 }, { lat: 43, lng: 3 }, { lat: 36, lng: 3 },
        { lat: 36, lng: -6 }, { lat: 39, lng: -9 }
    ],
    scandinavia: [ // Norway, Sweden
        { lat: 71, lng: 25 }, { lat: 70, lng: 31 }, { lat: 55, lng: 15 },
        { lat: 55, lng: 10 }, { lat: 60, lng: 5 }, { lat: 70, lng: 20 }
    ]
};
