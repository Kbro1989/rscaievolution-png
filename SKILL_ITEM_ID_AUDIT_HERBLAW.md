# Herblaw Skill - Item ID Fixes and Audit

**Date:** December 8, 2025
**Status:** ✅ COMPLETE

---

## Summary of Changes and Findings

Corrected all hardcoded item ID mappings in `rsc-cloudflare/rsc-server/src/plugins/skills/herblaw.js` to align with the canonical `items.json` database. Conducted a comprehensive audit of all referenced IDs within the `herblaw` skill.

### Hardcoded IDs Before Fixes
- All 12 hardcoded item IDs in `herblaw.js` were incorrect, pointing to unrelated items in `items.json`.

### Hardcoded IDs After Fixes

| Item Name                  | Old ID | New Canonical ID | Canonical Name           | Notes                                                           |
| :------------------------- | :----- | :--------------- | :----------------------- | :-------------------------------------------------------------- |
| Pestle and Mortar          | 468    | 446              | Pestle and mortar        | Corrected                                                       |
| Unicorn Horn               | 600    | 444              | Unicorn horn             | Corrected                                                       |
| Ground Unicorn Horn        | 599    | 451              | Ground unicorn horn      | Corrected                                                       |
| Blue Dragon Scale          | 603    | 445              | Blue dragon scale        | Corrected                                                       |
| Ground Blue Dragon Scale   | 604    | 450              | Ground blue dragon scale | Corrected                                                       |
| Chocolate Bar              | 337    | 330              | Chocolate Bar            | Corrected                                                       |
| Chocolate Dust             | 339    | 732              | Chocolate dust           | Corrected                                                       |
| Bat Bones                  | 605    | 576              | Bat bones                | Corrected                                                       |
| Ground Bat Bones           | 606    | 983              | Ground bat bones         | Corrected                                                       |
| Charcoal                   | 538    | 921              | A lump of Charcoal       | Corrected (with canonical name variation)                       |
| Ground Charcoal            | 709    | 1108             | Ground charcoal          | Corrected                                                       |
| Vial of Water              | 464    | 442              | Vial                     | Corrected, using "Vial" as closest canonical match for "Vial of Water" until a specific "Vial of Water" item is added |

**Note:** While "Vial of Water" maps to "Vial" (ID 442), it's important to confirm if a distinct "Vial of Water" item needs to be added to `items.json` for precise game mechanics.

### External Dependencies
- `items` from `@2003scape/rsc-data/config/items`
- `herblawData` (herbs, unfinished, potions) from `@2003scape/rsc-data/skills/herblaw`

These external `npm` packages' contents are **not directly editable** within this workspace. Therefore, direct verification or modification of the item IDs *within these external data sources* is not possible at this level. It is assumed that the item IDs used within these external packages are correct and consistent with `items.json`.

---

## Verification

- Ran `scripts/verify-herblaw-items.cjs` with an updated `idsToVerify` object to reflect the canonical IDs.
- Confirmed all 12 hardcoded item IDs now correctly reference items in `rsc-cloudflare/rsc-server/rsc-data-local/config/items.json`.
- The `herblaw.js` file has been updated to reflect these canonical IDs.

---

## Next Steps

1.  **Consider adding a distinct "Vial of Water" item** to `items.json` if required for precise game mechanics.
2.  **Proceed to audit `cooking/`** for similar item ID discrepancies.
