// Major inland water bodies defined by center point and radius (in degrees)
export const INLAND_LAKES = [
    { name: "Caspian Sea", lat: 42.0, lng: 51.0, radius: 3.5 },
    { name: "Black Sea", lat: 43.0, lng: 34.0, radius: 2.8 },
    { name: "Lake Superior", lat: 47.7, lng: -87.5, radius: 2.0 }, // Increased for visibility
    { name: "Lake Michigan", lat: 44.0, lng: -87.0, radius: 1.5 },
    { name: "Lake Huron", lat: 44.8, lng: -82.4, radius: 1.5 },
    { name: "Lake Erie", lat: 42.2, lng: -81.2, radius: 1.0 },
    { name: "Lake Ontario", lat: 43.7, lng: -77.9, radius: 0.8 },
    { name: "Lake Victoria", lat: -1.0, lng: 33.0, radius: 1.8 },
    { name: "Lake Tanganyika", lat: -6.0, lng: 29.5, radius: 1.0 },
    { name: "Lake Baikal", lat: 53.5, lng: 108.0, radius: 1.3 },
    { name: "Great Bear Lake", lat: 66.0, lng: -121.0, radius: 1.5 },
    { name: "Great Slave Lake", lat: 61.5, lng: -114.0, radius: 1.3 },
    { name: "Lake Ladoga", lat: 61.0, lng: 31.5, radius: 1.0 },
    { name: "Aral Sea", lat: 45.0, lng: 60.0, radius: 1.2 },
    { name: "Lake Balkhash", lat: 46.5, lng: 74.5, radius: 1.2 },
    { name: "Lake Chad", lat: 13.0, lng: 14.0, radius: 1.0 },
    { name: "Lake Maracaibo", lat: 9.8, lng: -71.5, radius: 0.8 },
    { name: "Lake Titicaca", lat: -15.8, lng: -69.4, radius: 0.7 },
];

// Major rivers defined by a series of points (path) and width
export const RIVER_PATHS = [
    // Amazon
    { name: "Amazon", width: 0.5, path: [[-4.4, -73.5], [-3.4, -60.0], [-1.4, -50.0], [0.0, -49.0]] },
    // Nile
    { name: "Nile", width: 0.4, path: [[-1.0, 33.0], [15.6, 32.5], [31.2, 30.0]] },
    // Mississippi
    { name: "Mississippi", width: 0.4, path: [[47.2, -95.2], [37.0, -89.0], [29.0, -89.0]] },
    // Yangtze
    { name: "Yangtze", width: 0.4, path: [[33.0, 91.0], [29.5, 106.5], [31.2, 121.5]] },
    // Yellow River
    { name: "Yellow River", width: 0.4, path: [[35.0, 96.0], [40.0, 110.0], [37.7, 119.0]] },
    // Congo
    { name: "Congo", width: 0.4, path: [[-11.0, 25.0], [0.0, 18.0], [-6.0, 12.0]] },
    // Ganges
    { name: "Ganges", width: 0.3, path: [[30.0, 79.0], [25.0, 88.0], [22.0, 90.0]] },
    // Danube
    { name: "Danube", width: 0.3, path: [[48.0, 8.0], [48.0, 16.0], [45.0, 29.0]] },
    // Volga
    { name: "Volga", width: 0.3, path: [[57.0, 33.0], [53.0, 50.0], [46.0, 48.0]] },
    // Indus
    { name: "Indus", width: 0.3, path: [[32.0, 79.0], [35.0, 75.0], [30.0, 71.0], [24.0, 68.0]] },
    // Mekong
    { name: "Mekong", width: 0.3, path: [[33.0, 94.0], [25.0, 100.0], [15.0, 106.0], [10.0, 106.0]] },
];
