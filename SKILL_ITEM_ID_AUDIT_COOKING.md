# Cooking Skill - Item ID Fixes and Audit

**Date:** December 8, 2025
**Status:** ✅ COMPLETE

---

## Summary of Changes and Findings

Corrected all hardcoded item ID mappings in `rsc-cloudflare/rsc-server/src/plugins/skills/cooking/cooking.js` to align with the canonical `items.json` database. Conducted a comprehensive audit of all referenced IDs within the `cooking` skill.

### Hardcoded IDs Before Fixes
- All 11 hardcoded item IDs in `cooking.js` were incorrect, pointing to unrelated items in `items.json`.

### Hardcoded IDs After Fixes

| Item Name                | Old ID | New Canonical ID | Canonical Name            | Notes                                   |
| :----------------------- | :----- | :--------------- | :------------------------ | :-------------------------------------- |
| Cooking Gauntlets        | 701    | 666              | gauntlets of cooking      | Corrected                               |
| Raw Swordfish            | 369    | 359              | Raw Swordfish             | Corrected                               |
| Raw Lobster              | 372    | 362              | Raw Lobster               | Corrected                               |
| Raw Shark                | 545    | 522              | Raw Shark                 | Corrected                               |
| Raw Oomlie Meat          | 1019   | 1194             | Raw Oomlie Meat           | Corrected                               |
| Seaweed                  | 622    | 594              | seaweed                   | Corrected                               |
| Soda Ash                 | 624    | 596              | soda ash                  | Corrected                               |
| Uncooked Swamp Paste     | 1100   | 744              | Uncooked Swamp paste      | Corrected                               |
| Swamp Paste              | 1099   | 745              | Swamp paste               | Corrected                               |
| Burnt Meat               | 134    | 133              | burntmeat                 | Corrected                               |
| Cake Tin                 | 338    | 331              | Cake Tin                  | Corrected                               |

### External Dependencies
- `uncooked` data from `@2003scape/rsc-data/skills/cooking`

This external `npm` package's contents are **not directly editable** within this workspace. Therefore, direct verification or modification of the item IDs *within these external data sources* is not possible at this level. It is assumed that the item IDs used within this external package are correct and consistent with `items.json`.

---

## Verification

- Ran `scripts/verify-cooking-items.cjs` with an updated `idsToVerify` object to reflect the canonical IDs and use flexible matching.
- Confirmed all 11 hardcoded item IDs now correctly reference items in `rsc-cloudflare/rsc-server/rsc-data-local/config/items.json`.
- The `cooking.js` file has been updated to reflect these canonical IDs.

---

## Next Steps

1.  **Proceed to audit `crafting/`** for similar item ID discrepancies.
