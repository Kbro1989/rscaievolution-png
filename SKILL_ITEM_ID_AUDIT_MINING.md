# Mining Skill - Item ID Fixes and Audit

**Date:** December 8, 2025
**Status:** ✅ COMPLETE (with 1 known missing item)

---

## Summary of Changes and Findings

Corrected hardcoded item ID mappings in `rsc-cloudflare/rsc-server/src/plugins/skills/mining.js` to align with the canonical `items.json` database. Conducted a comprehensive audit of all referenced IDs within the `mining` skill.

### Hardcoded IDs Before Fixes
- **Pickaxe IDs:** `1262, 1261, 1260, 1259, 1258, 1263` (all were incorrect/non-existent in `items.json`)
- **Gem IDs:** `Sapphire` (ID `164`) was incorrect (`Herb` in `items.json`)
- **Key Halves:** `Loop Half of Key` (ID `390`) and `Tooth Half of Key` (ID `391`) were incorrect (mapped to `Rune Chain Mail Body` and `Rune Plate Mail Body`)
- **Dragonstone Amulet (u):** `597` was incorrect (`sand` in `items.json`)

### Hardcoded IDs After Fixes

| Item Name                 | Old ID | New Canonical ID | Notes                                                 |
| :------------------------ | :----- | :--------------- | :---------------------------------------------------- |
| Bronze Pickaxe            | 1262   | 155              | Corrected                                             |
| Iron Pickaxe              | 1261   | 1184             | Corrected                                             |
| Steel Pickaxe             | 1260   | 1185             | Corrected                                             |
| Mithril Pickaxe           | 1259   | 1186             | Corrected                                             |
| Adamant Pickaxe           | 1258   | **1258**         | **MISSING from `items.json` - ID 1258 is placeholder** |
| Rune Pickaxe              | 1263   | 1188             | Corrected                                             |
| Diamond                   | 160    | 160              | Already correct                                       |
| Ruby                      | 161    | 161              | Already correct                                       |
| Emerald                   | 162    | 162              | Already correct                                       |
| Sapphire                  | 164    | 163              | Corrected                                             |
| Loop Half of Key          | 390    | *Removed*        | No distinct item in `items.json` - Removed from drops |
| Tooth Half of Key         | 391    | *Removed*        | No distinct item in `items.json` - Removed from drops |
| Dragonstone Amulet (unstrung) | 597    | 582              | Corrected                                             |

**Note:** The `Adamant Pickaxe` is currently `NOT FOUND` in the `items.json` database. ID `1258` is a placeholder. This item needs to be added to `items.json` if it's intended to be a mineable pickaxe.

### External Dependencies
- `items` from `@2003scape/rsc-data/config/items`
- `rocks` and `pickaxes` from `@2003scape/rsc-data/skills/mining`

These external `npm` packages' contents are **not directly editable** within this workspace. Therefore, direct verification or modification of the item IDs for specific rocks and pickaxes *within these external data sources* is not possible at this level.

---

## Verification

- Ran `scripts/verify-mining-items.cjs` with updated `idsToVerify` object.
- Confirmed all hardcoded item IDs (except `Adamant Pickaxe`) now correctly reference items in `rsc-cloudflare/rsc-server/rsc-data-local/config/items.json`.
- The `mining.js` file has been updated to reflect these canonical IDs and to remove references to non-existent key halves.

---

## Next Steps

1.  **Consider adding `Adamant Pickaxe`** to `items.json` if it's a required item.
2.  **Proceed to audit `herblaw.js`** for similar item ID discrepancies.
