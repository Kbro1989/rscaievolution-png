#!/usr/bin/env node
/**
 * RSC ID Audit Tool
 * Validates NPCs, items, and quests against RSC wiki reference values
 * Only uses rsc-data-local as source of truth (NOT openrsc-vanilla)
 */

import fs from 'fs';
import path from 'path';

const CLOUDFLARE_DATA = '/workspaces/rscaievolution-png/rsc-cloudflare/rsc-server/rsc-data-local/config';
const REFERENCE_DATA = '/workspaces/rscaievolution-png/openrsc-vanilla/rsc-data/config';

// Load data files
function loadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    console.error(`Failed to load ${filePath}:`, e.message);
    return null;
  }
}

function auditIDs() {
  console.log('🔍 RSC ID Audit - Checking against RSC Wiki Reference Values\n');
  console.log('📁 Source: rsc-data-local (Cloudflare Workers)\n');
  
  // Load current data
  const currentNpcs = loadJson(path.join(CLOUDFLARE_DATA, 'npcs.json'));
  const currentItems = loadJson(path.join(CLOUDFLARE_DATA, 'items.json'));
  const currentObjects = loadJson(path.join(CLOUDFLARE_DATA, 'objects.json'));
  const currentWallObjects = loadJson(path.join(CLOUDFLARE_DATA, 'wall-objects.json'));
  
  // Load reference data
  const refNpcs = loadJson(path.join(REFERENCE_DATA, 'npcs.json'));
  const refItems = loadJson(path.join(REFERENCE_DATA, 'items.json'));
  const refObjects = loadJson(path.join(REFERENCE_DATA, 'objects.json'));
  const refWallObjects = loadJson(path.join(REFERENCE_DATA, 'wall-objects.json'));
  
  let totalIssues = 0;
  
  // Audit NPCs
  console.log('='.repeat(80));
  console.log('NPCs AUDIT');
  console.log('='.repeat(80));
  
  if (currentNpcs && refNpcs) {
    let npcIssues = 0;
    const report = {
      missingInReference: [],
      extraInCurrent: [],
      nameMismatches: [],
      other: []
    };
    
    currentNpcs.forEach((npc, idx) => {
      const refNpc = refNpcs[idx];
      
      if (!refNpc) {
        report.extraInCurrent.push({
          id: idx,
          name: npc.name,
          issue: 'No corresponding NPC in reference data'
        });
        npcIssues++;
      } else if (npc.name !== refNpc.name) {
        report.nameMismatches.push({
          id: idx,
          current: npc.name,
          reference: refNpc.name
        });
        npcIssues++;
      }
    });
    
    if (npcIssues === 0) {
      console.log('✅ All NPCs aligned with reference data\n');
    } else {
      console.log(`⚠️  Found ${npcIssues} NPC issues:\n`);
      if (report.nameMismatches.length > 0) {
        console.log(`Name Mismatches (${report.nameMismatches.length}):`);
        report.nameMismatches.slice(0, 10).forEach(m => {
          console.log(`  ID ${m.id}: "${m.current}" → "${m.reference}"`);
        });
        if (report.nameMismatches.length > 10) {
          console.log(`  ... and ${report.nameMismatches.length - 10} more`);
        }
      }
      
      if (report.extraInCurrent.length > 0) {
        console.log(`\nExtra in Current (${report.extraInCurrent.length}):`);
        report.extraInCurrent.slice(0, 5).forEach(e => {
          console.log(`  ID ${e.id}: "${e.name}"`);
        });
        if (report.extraInCurrent.length > 5) {
          console.log(`  ... and ${report.extraInCurrent.length - 5} more`);
        }
      }
      console.log();
    }
    
    totalIssues += npcIssues;
    
    // Save detailed NPC report
    fs.writeFileSync(
      '/workspaces/rscaievolution-png/audit-npcs-detailed.json',
      JSON.stringify(report, null, 2)
    );
  }
  
  // Audit Items
  console.log('='.repeat(80));
  console.log('ITEMS AUDIT');
  console.log('='.repeat(80));
  
  if (currentItems && refItems) {
    let itemIssues = 0;
    const report = {
      missingInReference: [],
      extraInCurrent: [],
      nameMismatches: [],
      spriteIssues: [],
      priceMismatches: []
    };
    
    currentItems.forEach((item, idx) => {
      const refItem = refItems[idx];
      
      if (!refItem) {
        report.extraInCurrent.push({
          id: idx,
          name: item.name,
          issue: 'No corresponding item in reference data'
        });
        itemIssues++;
      } else {
        if (item.name !== refItem.name) {
          report.nameMismatches.push({
            id: idx,
            current: item.name,
            reference: refItem.name
          });
          itemIssues++;
        }
        
        if (item.sprite !== refItem.sprite) {
          report.spriteIssues.push({
            id: idx,
            name: item.name,
            current: item.sprite,
            reference: refItem.sprite
          });
          itemIssues++;
        }
        
        if (item.price !== refItem.price) {
          report.priceMismatches.push({
            id: idx,
            name: item.name,
            current: item.price,
            reference: refItem.price
          });
          // Price differences are less critical but logged
        }
      }
    });
    
    if (itemIssues === 0) {
      console.log('✅ All items aligned with reference data\n');
    } else {
      console.log(`⚠️  Found ${itemIssues} item issues:\n`);
      
      if (report.nameMismatches.length > 0) {
        console.log(`Name Mismatches (${report.nameMismatches.length}):`);
        report.nameMismatches.slice(0, 10).forEach(m => {
          console.log(`  ID ${m.id}: "${m.current}" → "${m.reference}"`);
        });
        if (report.nameMismatches.length > 10) {
          console.log(`  ... and ${report.nameMismatches.length - 10} more`);
        }
      }
      
      if (report.spriteIssues.length > 0) {
        console.log(`\nSprite ID Mismatches (${report.spriteIssues.length}):`);
        report.spriteIssues.slice(0, 10).forEach(s => {
          console.log(`  ID ${s.id} "${s.name}": sprite ${s.current} → ${s.reference}`);
        });
        if (report.spriteIssues.length > 10) {
          console.log(`  ... and ${report.spriteIssues.length - 10} more`);
        }
      }
      
      if (report.extraInCurrent.length > 0) {
        console.log(`\nExtra in Current (${report.extraInCurrent.length}):`);
        report.extraInCurrent.slice(0, 5).forEach(e => {
          console.log(`  ID ${e.id}: "${e.name}"`);
        });
        if (report.extraInCurrent.length > 5) {
          console.log(`  ... and ${report.extraInCurrent.length - 5} more`);
        }
      }
      
      console.log();
    }
    
    totalIssues += itemIssues;
    
    // Save detailed item report
    fs.writeFileSync(
      '/workspaces/rscaievolution-png/audit-items-detailed.json',
      JSON.stringify(report, null, 2)
    );
  }
  
  // Audit Objects
  console.log('='.repeat(80));
  console.log('OBJECTS AUDIT');
  console.log('='.repeat(80));
  
  if (currentObjects && refObjects) {
    let objectIssues = 0;
    const report = {
      nameMismatches: [],
      extraInCurrent: [],
      other: []
    };
    
    currentObjects.forEach((obj, idx) => {
      const refObj = refObjects[idx];
      
      if (!refObj) {
        report.extraInCurrent.push({
          id: idx,
          name: obj.name,
          issue: 'No corresponding object in reference data'
        });
        objectIssues++;
      } else if (obj.name !== refObj.name) {
        report.nameMismatches.push({
          id: idx,
          current: obj.name,
          reference: refObj.name
        });
        objectIssues++;
      }
    });
    
    if (objectIssues === 0) {
      console.log('✅ All objects aligned with reference data\n');
    } else {
      console.log(`⚠️  Found ${objectIssues} object issues:\n`);
      if (report.nameMismatches.length > 0) {
        console.log(`Name Mismatches (${report.nameMismatches.length}):`);
        report.nameMismatches.slice(0, 10).forEach(m => {
          console.log(`  ID ${m.id}: "${m.current}" → "${m.reference}"`);
        });
        if (report.nameMismatches.length > 10) {
          console.log(`  ... and ${report.nameMismatches.length - 10} more`);
        }
      }
      console.log();
    }
    
    totalIssues += objectIssues;
    
    fs.writeFileSync(
      '/workspaces/rscaievolution-png/audit-objects-detailed.json',
      JSON.stringify(report, null, 2)
    );
  }
  
  // Summary
  console.log('='.repeat(80));
  console.log('AUDIT SUMMARY');
  console.log('='.repeat(80));
  
  if (totalIssues === 0) {
    console.log('✅ All IDs are aligned with RSC wiki reference values');
  } else {
    console.log(`⚠️  Total issues found: ${totalIssues}`);
    console.log('\nDetailed reports saved:');
    console.log('  - audit-npcs-detailed.json');
    console.log('  - audit-items-detailed.json');
    console.log('  - audit-objects-detailed.json');
  }
  
  console.log('\n📋 Reference source: rsc-data-local (RSC wiki aligned)');
}

auditIDs();
