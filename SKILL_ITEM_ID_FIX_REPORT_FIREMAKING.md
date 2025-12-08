# Firemaking Skill - Item ID Fixes

**Date:** December 8, 2025
**Status:** ✅ COMPLETE

---

## Summary of Changes

Fixed incorrect item ID mappings in `rsc-cloudflare/rsc-server/src/plugins/skills/firemaking.js` to align with the canonical `items.json` database.

### Before Fix
- `ASHES_ID` was `181` (mapped to "Apron" in `items.json`)
- `TINDERBOX_ID` was `166` (mapped to "chisel" in `items.json`)

### After Fix
- `ASHES_ID` is now `180` (correctly maps to "Ashes")
- `TINDERBOX_ID` is now `165` (correctly maps to "Tinderbox")

### Log Data
The `logs` data for firemaking is sourced from an external `npm` package: `@2003scape/rsc-data/skills/firemaking`.
- This data is **not directly editable** within the current project workspace.
- It is assumed that the item IDs used within this external package for logs are correct and consistent with `items.json`.

---

## Verification

- Confirmed `ASHES_ID` (180) and `TINDERBOX_ID` (165) now correctly reference "Ashes" and "Tinderbox" in `rsc-cloudflare/rsc-server/rsc-data-local/config/items.json`.
- The `firemaking.js` file has been updated to reflect these canonical IDs.

---

## Next Steps

Proceed to audit other skill files for similar item ID discrepancies, focusing on `cooking/`, `crafting/`, `smithing/`, `fishing.js`, `woodcutting.js`, `mining.js`, `herblaw.js`, `fletching.js`, `magic.js`, `prayer.js`, and `thieving.js`.
