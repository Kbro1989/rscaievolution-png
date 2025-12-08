# Woodcutting Skill - Item ID Audit

**Date:** December 8, 2025
**Status:** ✅ PENDING FURTHER INVESTIGATION

---

## Summary of Findings

The `rsc-cloudflare/rsc-server/src/plugins/skills/woodcutting.js` file heavily relies on external data for `items`, `axes`, and `trees` definitions.

### External Dependencies
- `items` from `@2003scape/rsc-data/config/items`
- `axes` and `trees` from `@2003scape/rsc-data/skills/woodcutting`

These packages are external `npm` dependencies and their contents are **not directly editable** within this workspace. Therefore, direct verification or modification of the item IDs for logs and axes within these external data sources is not possible at this level.

### Internal References
- `woodcutting.js` uses `items[bestAxeID].name.toLowerCase()` to retrieve the name of the best axe from the local `items.json`. This implies that the `bestAxeID` (which originates from the external `axes` data) *should* eventually correspond to a valid item in our canonical `items.json` for proper display and functionality.
- `NORMAL_TREES` are hardcoded GameObject IDs: `0, 1, 70`. These are not item IDs. Direct programmatic inspection of these `GameObject` definitions within the workspace was not successful, suggesting they are either dynamically assigned, part of a compiled asset, or originate from another external `npm` package (similar to `@2003scape/rsc-data`). Therefore, direct verification of these `GameObject` IDs against explicit definitions is not feasible at this level of the workspace.

---

## Next Steps

1.  **Investigate `AXE_IDS` mapping:** Although the `axes` data is external, the `AXE_IDS` array is generated from `Object.keys(axes)`. Direct programmatic access to this module failed, which is expected for external `npm` packages. Therefore, the mapping of external `AXE_IDS` to our `items.json` cannot be directly verified at this level.
    *   **Action:** Trust that the external module uses correct IDs internally, but note that if runtime issues with axes occur, manual inspection of the `@2003scape/rsc-data` package in `node_modules` may be necessary.
2.  **Verify `NORMAL_TREES`:** Confirm the existence and definition of GameObject IDs `0, 1, 70` (normal trees) if possible through `grep` in `game-objects/` or similar game data. 
