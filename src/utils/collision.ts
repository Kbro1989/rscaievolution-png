// Utility for collision detection using world object data
// This is a mock; replace with actual game map/object lookup

// Example blocked tiles (replace with real data)
const blockedTiles = [
  { lat: 10, lon: 20 },
  { lat: 15, lon: 25 },
  // ...
];

export function isBlocked(lat: number, lon: number): boolean {
  // Replace with actual logic using objects.json/wall-objects.json
  return blockedTiles.some(tile => tile.lat === Math.round(lat) && tile.lon === Math.round(lon));
}
