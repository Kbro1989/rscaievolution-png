# Crafting Skill - Item ID Fixes and Audit

**Date:** December 8, 2025
**Status:** ✅ COMPLETE (for gem-cutting.js, leather.js & jewellery.js)

---

## Summary of Changes and Findings

Corrected hardcoded item ID mappings in `rsc-cloudflare/rsc-server/src/plugins/skills/crafting/gem-cutting.js`, `rsc-cloudflare/rsc-server/src/plugins/skills/crafting/leather.js`, and `rsc-cloudflare/rsc-server/src/plugins/skills/crafting/jewellery.js` to align with the canonical `items.json` database. Conducted an audit of referenced IDs within the `gem-cutting`, `leather`, and `jewellery` functionalities.

### Gem Cutting - Hardcoded IDs After Fixes

| Item Name | Old ID | New Canonical ID | Canonical Name | Notes     |
| :-------- | :----- | :--------------- | :------------- | :-------- |
| Chisel    | 167    | 166              | chisel         | Corrected |

### Leather Crafting - Hardcoded IDs After Fixes

| Item Name | Old ID | New Canonical ID | Canonical Name | Notes     |
| :-------- | :----- | :--------------- | :------------- | :-------- |
| Leather   | 148    | 147              | leather        | Corrected |
| Needle    | 39     | 39               | Needle         | Correct   |
| Thread    | 43     | 43               | Thread         | Correct   |

### Jewellery Crafting - Hardcoded IDs After Fixes

| Item/Object Name           | Old ID | New Canonical ID | Canonical Name             | Notes                                                         |
| :------------------------- | :----- | :--------------- | :------------------------- | :------------------------------------------------------------ |
| Gold Bar                   | 172    | 171              | gold bar                   | Corrected                                                     |
| Silver Bar                 | 384    | 374              | silver bar                 | Corrected                                                     |
| Ring Mould (from external) | 455    | 286              | ring mould                 | Hardcoded due to external data discrepancy                  |
| Necklace Mould (from external) | 456    | 288              | Necklace mould             | Hardcoded due to external data discrepancy                  |
| Amulet Mould (from external) | 457    | 287              | Amulet mould               | Hardcoded due to external data discrepancy                  |
| Furnace (GameObject)       | 118    | 89               | furnace (model ID 89)      | Corrected GameObject ID                                       |

### Pottery Crafting - Hardcoded IDs After Fixes

| Item/Object Name      | Old ID | New Canonical ID | Canonical Name        | Notes                                                                                                    |
| :-------------------- | :----- | :--------------- | :-------------------- | :------------------------------------------------------------------------------------------------------- |
| Clay                  | 149    | 148              | clay                  | Corrected                                                                                                |
| Soft Clay             | 243    | 238              | Soft Clay             | Corrected                                                                                                |
| Water (in `WATER_IDS`) | 50     | 50               | water                 | Correct. Produces empty bucket (ID 21)                                                                   |
| Wine (in `WATER_IDS`)  | 141    | 141              | wine                  | Correct. Produces empty bucket (ID 21)                                                                   |
| Empty Bucket          | 140    | 21               | Bucket                | Corrected output of `WATER_IDS`                                                                          |
| Pottery Oven (GameObject) | 178    | 178              | pottery oven          | Correct GameObject ID                                                                                    |
| Pottery Wheel (GameObject) | 179    | 179              | potter's wheel        | GameObject ID 179 used, but explicit definition not found. Assumed correct/implicit or external definition. |
| Vial of Water         | N/A    | 442              | Vial                  | Not a distinct item; 'Vial' used as best fit. A specific 'Vial of Water' item may need to be added.   |

### External Dependencies
- `items` from `@2003scape/rsc-data/config/items`
- `pottery` data from `@2003scape/rsc-data/skills/crafting`

These external `npm` packages' contents are **not directly editable** within this workspace. Therefore, direct verification or modification of the item IDs for specific items *within these external data sources* is not possible at this level. It is assumed that the item IDs used within these external packages are correct and consistent with `items.json`.

---

## Verification

- Ran direct `node -e` command to verify `CHISEL_ID` (166) now correctly references "chisel" in `rsc-cloudflare/rsc-server/rsc-data-local/config/items.json`.
- Ran `scripts/verify-leather-crafting-items.cjs` with an updated `idsToVerify` object to reflect the canonical IDs.
- Confirmed `LEATHER_ID` (147), `NEEDLE_ID` (39), and `THREAD_ID` (43) now correctly reference "leather", "Needle", and "Thread" respectively in `rsc-cloudflare/rsc-server/rsc-data-local/config/items.json`.
- Ran `scripts/verify-jewellery-items.cjs` with an updated `idsToVerify` object to reflect the canonical IDs for Gold/Silver bars, and confirmed hardcoded Mould IDs.
- Confirmed `FURNACE_ID` (89) correctly maps to a generic furnace GameObject.
- Ran `scripts/verify-pottery-items.cjs` with an updated `itemIdsToVerify` and `objectIdsToVerify` to reflect canonical IDs for Pottery items and objects.
- Confirmed `CLAY_ID` (148), `SOFT_CLAY_ID` (238), `WATER_IDS` items (141, 50, 21), `POTTERY_OVEN_ID` (178), and `POTTERY_WHEEL_ID` (179) are correctly mapped or noted.
- The `gem-cutting.js`, `leather.js`, `jewellery.js`, and `pottery.js` files have been updated to reflect these canonical IDs.

---

## Next Steps

1.  **Proceed to audit other files within the `crafting/` directory** (`battlestaff.js`, `dye-cape.js`, `glass.js`, `spinning-wheel.js`, `stringing.js`) for similar item ID discrepancies.
