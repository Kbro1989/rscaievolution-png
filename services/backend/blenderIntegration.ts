
// import { exec } from 'child_process';
// import { promisify } from 'util';
// import path from 'path';
// import fs from 'fs/promises';

// const execAsync = promisify(exec);

interface BlenderGenerateOptions {
    type: 'tree' | 'rock' | 'npc' | 'item';
    variant: string;
    complexity?: number;
    seed?: number;
}

interface BlenderResult {
    modelPath: string;
    thumbnailPath?: string;
}

/**
 * Blender Integration for Procedural Content Generation
 * 
 * This service calls Blender's Python API to generate 3D models procedurally
 * when Gronk needs resources that don't exist in the game world.
 */
export class BlenderGenerator {
    private blenderPath: string;
    private scriptsPath: string;
    private outputPath: string;

    constructor() {
        // Try to find Blender executable
        // We can't access process.env in browser safely without polyfills, but this is server code
        if (typeof process !== 'undefined' && process.env) {
            this.blenderPath = process.env.BLENDER_PATH || 'blender';
            this.scriptsPath = 'blender-scripts'; // Resolved dynamically later
            this.outputPath = 'public/models/generated'; // Resolved dynamically later
        } else {
            this.blenderPath = '';
            this.scriptsPath = '';
            this.outputPath = '';
        }
    }

    /**
     * Check if Blender is installed and accessible
     */
    async checkBlenderInstalled(): Promise<boolean> {
        if (typeof window !== 'undefined') return false; // Browser check

        try {
            const { exec } = await import('child_process');
            const { promisify } = await import('util');
            const execAsync = promisify(exec);

            const { stdout } = await execAsync(`${this.blenderPath} --version`);
            console.log('[Blender] Found:', stdout.trim().split('\n')[0]);
            return true;
        } catch (error) {
            console.error('[Blender] Not found or not in PATH');
            return false;
        }
    }

    /**
     * Generate a 3D model using Blender
     */
    async generateModel(options: BlenderGenerateOptions): Promise<BlenderResult> {
        if (typeof window !== 'undefined') {
            console.warn('[Blender] Cannot generate models in browser');
            return { modelPath: '' };
        }

        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const path = (await import('path')).default;
        const fs = (await import('fs/promises')).default;
        const execAsync = promisify(exec);

        const { type, variant, complexity = 5, seed = Date.now() } = options;

        console.log(`[Blender] Generating ${type}:${variant}...`);

        const cwd = process.cwd();
        const scriptsPath = path.join(cwd, 'blender-scripts');
        const outputPath = path.join(cwd, 'public', 'models', 'generated');

        // Ensure output directory exists
        await fs.mkdir(outputPath, { recursive: true });

        // Determine which Python script to use
        const scriptName = `generate_${type}.py`;
        const scriptPath = path.join(scriptsPath, scriptName);

        // Output file name
        const outputFileName = `${type}_${variant}_${seed}.glb`;
        const outputFilePath = path.join(outputPath, outputFileName);

        // Build Blender command
        const command = [
            this.blenderPath,
            '--background',
            '--python', scriptPath,
            '--',
            '--type', variant,
            '--complexity', complexity.toString(),
            '--seed', seed.toString(),
            '--output', outputFilePath
        ].join(' ');

        try {
            const { stdout, stderr } = await execAsync(command, {
                timeout: 30000, // 30 second timeout
            });

            if (stderr && !stderr.includes('Warning')) {
                console.error('[Blender] Stderr:', stderr);
            }

            console.log('[Blender] Generated:', outputFilePath);

            return {
                modelPath: `/models/generated/${outputFileName}`,
            };
        } catch (error: any) {
            console.error('[Blender] Generation failed:', error.message);
            throw new Error(`Blender generation failed: ${error.message}`);
        }
    }

    /**
     * Generate a tree model
     */
    async generateTree(treeType: 'oak' | 'willow' | 'yew' | 'maple'): Promise<string> {
        const result = await this.generateModel({
            type: 'tree',
            variant: treeType,
            complexity: 7,
        });
        return result.modelPath;
    }

    /**
     * Generate a rock/ore node model
     */
    async generateRock(rockType: 'copper' | 'iron' | 'coal' | 'gold'): Promise<string> {
        const result = await this.generateModel({
            type: 'rock',
            variant: rockType,
            complexity: 5,
        });
        return result.modelPath;
    }

    /**
     * Generate an NPC model
     */
    async generateNPC(npcType: string): Promise<string> {
        const result = await this.generateModel({
            type: 'npc',
            variant: npcType,
            complexity: 8,
        });
        return result.modelPath;
    }

    /**
     * Generate an item model
     */
    async generateItem(itemType: string): Promise<string> {
        const result = await this.generateModel({
            type: 'item',
            variant: itemType,
            complexity: 4,
        });
        return result.modelPath;
    }
}

// Singleton instance
export const blenderGenerator = new BlenderGenerator();
