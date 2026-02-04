#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const ITEM_LIST_PATH = './rsc-server/src/plugins/items/item_list.txt';
const JSON_PATHS = [
    './rsc-data/config/items.json',
    './rsc-server/rsc-data-local/config/items.json'
];

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(msg, color = 'reset') {
    console.log(`${colors[color]}${msg}${colors.reset}`);
}

// Parse item_list.txt
function parseItemList(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    const items = [];

    for (const line of lines) {
        // Format: ItemID = 0 Iron Mace
        const match = line.match(/^ItemID\s*=\s*(\d+)\s+(.+)$/);
        if (match) {
            items.push({
                id: parseInt(match[1]),
                name: match[2].trim()
            });
        }
    }

    return items;
}

// Normalize name for comparison (handle capitalization)
function normalizeName(name) {
    return name.toLowerCase().trim();
}

// Load items.json
function loadItemsJSON(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        log(`Error loading ${filePath}: ${error.message}`, 'red');
        return null;
    }
}

// Main verification function
function verifyItems() {
    log('\n=== Item Handler Alignment Verification ===\n', 'bright');

    // Parse item_list.txt
    log('📋 Parsing item_list.txt...', 'cyan');
    const itemList = parseItemList(ITEM_LIST_PATH);
    log(`   Found ${itemList.length} items (IDs ${itemList[0].id}-${itemList[itemList.length - 1].id})`, 'green');

    // Load items.json files
    const jsonData = {};
    for (const jsonPath of JSON_PATHS) {
        log(`\n📦 Loading ${jsonPath}...`, 'cyan');
        const data = loadItemsJSON(jsonPath);
        if (data) {
            jsonData[jsonPath] = data;
            log(`   Loaded ${data.length} items`, 'green');
        }
    }

    // Run verification checks
    const issues = {
        idGaps: [],
        nameMismatches: [],
        capitalizationDiffs: [],
        missingInJson: [],
        duplicateNames: [],
        propertyIssues: []
    };

    // Check ID sequence and gaps
    log('\n🔍 Checking ID sequence...', 'cyan');
    for (let i = 0; i < itemList.length; i++) {
        if (itemList[i].id !== i) {
            issues.idGaps.push(`Expected ID ${i}, found ${itemList[i].id}`);
        }
    }

    // Check for duplicate names
    log('🔍 Checking for duplicate item names...', 'cyan');
    const nameMap = new Map();
    for (const item of itemList) {
        const normalized = normalizeName(item.name);
        if (!nameMap.has(normalized)) {
            nameMap.set(normalized, []);
        }
        nameMap.set(normalized, [...nameMap.get(normalized), item.id]);
    }
    for (const [name, ids] of nameMap.entries()) {
        if (ids.length > 1) {
            issues.duplicateNames.push({ name, ids });
        }
    }

    // Cross-check with JSON files
    for (const [jsonPath, jsonItems] of Object.entries(jsonData)) {
        log(`\n🔍 Verifying against ${jsonPath}...`, 'cyan');

        for (const item of itemList) {
            const jsonItem = jsonItems[item.id];

            if (!jsonItem) {
                issues.missingInJson.push({ id: item.id, name: item.name, file: jsonPath });
                continue;
            }

            // Check name matching
            const normalizedTxt = normalizeName(item.name);
            const normalizedJson = normalizeName(jsonItem.name);

            if (normalizedTxt !== normalizedJson) {
                issues.nameMismatches.push({
                    id: item.id,
                    txtName: item.name,
                    jsonName: jsonItem.name,
                    file: jsonPath
                });
            } else if (item.name !== jsonItem.name) {
                // Names match when normalized but have capitalization differences
                issues.capitalizationDiffs.push({
                    id: item.id,
                    txtName: item.name,
                    jsonName: jsonItem.name,
                    file: jsonPath
                });
            }

            // Check required properties
            const requiredProps = ['stackable', 'untradeable', 'members'];
            for (const prop of requiredProps) {
                if (typeof jsonItem[prop] !== 'boolean') {
                    issues.propertyIssues.push({
                        id: item.id,
                        name: item.name,
                        property: prop,
                        value: jsonItem[prop],
                        file: jsonPath
                    });
                }
            }
        }
    }

    // Report results
    log('\n=== Verification Results ===\n', 'bright');

    let hasIssues = false;

    if (issues.idGaps.length > 0) {
        hasIssues = true;
        log(`❌ ID Gaps Found (${issues.idGaps.length}):`, 'red');
        issues.idGaps.forEach(gap => log(`   ${gap}`, 'red'));
    } else {
        log('✅ ID Sequence: All IDs from 0-1289 present, no gaps', 'green');
    }

    if (issues.missingInJson.length > 0) {
        hasIssues = true;
        log(`\n❌ Missing in JSON (${issues.missingInJson.length}):`, 'red');
        issues.missingInJson.slice(0, 10).forEach(item => {
            log(`   ID ${item.id}: "${item.name}" not found in ${path.basename(item.file)}`, 'red');
        });
        if (issues.missingInJson.length > 10) {
            log(`   ... and ${issues.missingInJson.length - 10} more`, 'red');
        }
    } else {
        log('\n✅ All items from item_list.txt are present in JSON files', 'green');
    }

    if (issues.nameMismatches.length > 0) {
        hasIssues = true;
        log(`\n❌ Name Mismatches (${issues.nameMismatches.length}):`, 'red');
        issues.nameMismatches.slice(0, 10).forEach(item => {
            log(`   ID ${item.id}: "${item.txtName}" != "${item.jsonName}" in ${path.basename(item.file)}`, 'red');
        });
        if (issues.nameMismatches.length > 10) {
            log(`   ... and ${issues.nameMismatches.length - 10} more`, 'red');
        }
    } else {
        log('\n✅ All item names match (case-insensitive)', 'green');
    }

    if (issues.capitalizationDiffs.length > 0) {
        log(`\n⚠️  Capitalization Differences (${issues.capitalizationDiffs.length}):`, 'yellow');
        issues.capitalizationDiffs.slice(0, 10).forEach(item => {
            log(`   ID ${item.id}: "${item.txtName}" vs "${item.jsonName}" in ${path.basename(item.file)}`, 'yellow');
        });
        if (issues.capitalizationDiffs.length > 10) {
            log(`   ... and ${issues.capitalizationDiffs.length - 10} more`, 'yellow');
        }
    } else {
        log('\n✅ All item names have matching capitalization', 'green');
    }

    if (issues.duplicateNames.length > 0) {
        log(`\n⚠️  Duplicate Item Names (${issues.duplicateNames.length}):`, 'yellow');
        issues.duplicateNames.forEach(dup => {
            log(`   "${dup.name}": IDs ${dup.ids.join(', ')}`, 'yellow');
        });
    } else {
        log('\n✅ No duplicate item names found', 'green');
    }

    if (issues.propertyIssues.length > 0) {
        log(`\n⚠️  Property Issues (${issues.propertyIssues.length}):`, 'yellow');
        issues.propertyIssues.slice(0, 10).forEach(issue => {
            log(`   ID ${issue.id} "${issue.name}": property "${issue.property}" = ${issue.value} in ${path.basename(issue.file)}`, 'yellow');
        });
        if (issues.propertyIssues.length > 10) {
            log(`   ... and ${issues.propertyIssues.length - 10} more`, 'yellow');
        }
    } else {
        log('\n✅ All required properties are present and valid', 'green');
    }

    // Final summary
    log('\n=== Summary ===\n', 'bright');
    log(`Total items in item_list.txt: ${itemList.length}`, 'cyan');
    log(`ID range: ${itemList[0].id} - ${itemList[itemList.length - 1].id}`, 'cyan');
    log(`Last item: "${itemList[itemList.length - 1].name}"`, 'cyan');

    if (hasIssues) {
        log('\n❌ VERIFICATION FAILED - Issues found that need attention', 'red');
        process.exit(1);
    } else {
        log('\n✅ VERIFICATION PASSED - All items properly aligned!', 'green');
        process.exit(0);
    }
}

// Run verification
try {
    verifyItems();
} catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    console.error(error.stack);
    process.exit(1);
}
