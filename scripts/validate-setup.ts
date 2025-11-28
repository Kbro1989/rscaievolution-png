#!/usr/bin/env tsx
/**
 * Validation Script for Hybrid Content Pipeline
 * Checks prerequisites: Blender, RSMV cache, and dependencies
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface CheckResult {
    name: string;
    passed: boolean;
    message: string;
    critical: boolean;
}

const checks: CheckResult[] = [];

async function checkBlender(): Promise<CheckResult> {
    const blenderPath = process.env.BLENDER_PATH ||
        'C:\\Program Files\\Blender Foundation\\Blender 5.0\\blender-launcher.exe';

    try {
        await fs.access(blenderPath);

        // Try to get version
        try {
            const { stdout } = await execAsync(`"${blenderPath}" --version`, { timeout: 5000 });
            const version = stdout.trim().split('\n')[0];
            return {
                name: 'Blender Installation',
                passed: true,
                message: `Found: ${version} at ${blenderPath}`,
                critical: false
            };
        } catch {
            return {
                name: 'Blender Installation',
                passed: true,
                message: `Found at ${blenderPath} (version check failed)`,
                critical: false
            };
        }
    } catch {
        return {
            name: 'Blender Installation',
            passed: false,
            message: `Not found at ${blenderPath}. Evolution transforms will be skipped.`,
            critical: false
        };
    }
}

async function checkRSMVCache(): Promise<CheckResult> {
    const cachePath = process.env.RSMV_CACHE_PATH || 'C:\\ProgramData\\Jagex\\RuneScape';

    try {
        const files = await fs.readdir(cachePath);
        const jcacheFiles = files.filter(f => f.endsWith('.jcache'));

        if (jcacheFiles.length > 0) {
            return {
                name: 'RuneScape Cache',
                passed: true,
                message: `Found ${jcacheFiles.length} cache files at ${cachePath}`,
                critical: true
            };
        } else {
            return {
                name: 'RuneScape Cache',
                passed: false,
                message: `Directory exists but no .jcache files found at ${cachePath}`,
                critical: true
            };
        }
    } catch {
        return {
            name: 'RuneScape Cache',
            passed: false,
            message: `Cache directory not found at ${cachePath}`,
            critical: true
        };
    }
}

async function checkRSMVLibrary(): Promise<CheckResult> {
    const rsmvPath = path.join(process.cwd(), 'libs', 'rsmv');

    try {
        await fs.access(path.join(rsmvPath, 'package.json'));
        await fs.access(path.join(rsmvPath, 'dist'));

        return {
            name: 'RSMV Library',
            passed: true,
            message: `Found at ${rsmvPath}`,
            critical: true
        };
    } catch {
        return {
            name: 'RSMV Library',
            passed: false,
            message: `Not found or not built. Run: cd libs/rsmv && npm i && npm run build`,
            critical: true
        };
    }
}

async function checkOutputDirectory(): Promise<CheckResult> {
    const outputPath = path.join(process.cwd(), 'public', 'models');

    try {
        await fs.mkdir(outputPath, { recursive: true });
        await fs.access(outputPath);

        return {
            name: 'Output Directory',
            passed: true,
            message: `Ready at ${outputPath}`,
            critical: true
        };
    } catch {
        return {
            name: 'Output Directory',
            passed: false,
            message: `Cannot create/access ${outputPath}`,
            critical: true
        };
    }
}

async function checkBlenderScripts(): Promise<CheckResult> {
    const scriptsPath = path.join(process.cwd(), 'blender-scripts');

    try {
        const files = await fs.readdir(scriptsPath);
        const requiredScripts = ['composite_entity.py', 'evolution_transformer.py'];
        const missingScripts = requiredScripts.filter(s => !files.includes(s));

        if (missingScripts.length === 0) {
            return {
                name: 'Blender Scripts',
                passed: true,
                message: `All required scripts found in ${scriptsPath}`,
                critical: false
            };
        } else {
            return {
                name: 'Blender Scripts',
                passed: false,
                message: `Missing scripts: ${missingScripts.join(', ')}`,
                critical: false
            };
        }
    } catch {
        return {
            name: 'Blender Scripts',
            passed: false,
            message: `Scripts directory not found at ${scriptsPath}`,
            critical: false
        };
    }
}

async function main() {
    console.log('🔍 Validating Hybrid Content Pipeline Setup\n');
    console.log('='.repeat(60));

    // Run all checks
    checks.push(await checkRSMVCache());
    checks.push(await checkRSMVLibrary());
    checks.push(await checkOutputDirectory());
    checks.push(await checkBlender());
    checks.push(await checkBlenderScripts());

    // Display results
    console.log('\n📋 Check Results:\n');

    for (const check of checks) {
        const icon = check.passed ? '✅' : '❌';
        const critical = check.critical ? ' [CRITICAL]' : '';
        console.log(`${icon} ${check.name}${critical}`);
        console.log(`   ${check.message}\n`);
    }

    // Summary
    console.log('='.repeat(60));

    const criticalFailed = checks.filter(c => c.critical && !c.passed);
    const passed = checks.filter(c => c.passed).length;
    const total = checks.length;

    console.log(`\n📊 Summary: ${passed}/${total} checks passed`);

    if (criticalFailed.length > 0) {
        console.log('\n⚠️  CRITICAL ISSUES (must fix):');
        criticalFailed.forEach(c => console.log(`   - ${c.name}`));
        console.log('\n❌ Setup is NOT ready. Please fix critical issues.\n');
        process.exit(1);
    } else {
        console.log('\n✅ Setup is ready for model generation!\n');
        console.log('Run: npm run generate-models\n');
        process.exit(0);
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
