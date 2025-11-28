
// import { exec } from 'child_process';
// import { promisify } from 'util';
// import path from 'path';
// import fs from 'fs/promises';

// const execAsync = promisify(exec);

// Polyfill for RSMV sqlite3 loader in Node environment
if (typeof globalThis !== 'undefined' && typeof (globalThis as any).__non_webpack_require__ === 'undefined') {
    (globalThis as any).__non_webpack_require__ = require;
}

/**
 * RSMV Entity Config
 * Example: NPC, Item, Loc (location/scenery)
 */
interface RSMVEntityConfig {
    name?: string;
    models?: number[];
    headModels?: number[];
    color_replacements?: [number, number][];
    material_replacements?: [number, number][];
    actions_0?: string;
    actions_2?: string;
}

/**
 * Hybrid Content Generator
 * 
 * Pipeline: RSMV Entity Config → Models → Blender Composite → Evolution → Game
 */
export class HybridContentGenerator {
    private rsmvCache: any;
    private blenderPath: string;
    private outputPath: string;
    private forceClassicModels = true; // Always use RSC classic models for evolution

    constructor() {
        // Use environment variable or default Windows installation
        if (typeof process !== 'undefined' && process.env) {
            this.blenderPath = process.env.BLENDER_PATH ||
                'C:\\Program Files\\Blender Foundation\\Blender 5.0\\blender-launcher.exe';
            this.outputPath = 'public/models/hybrid'; // Resolved dynamically
        } else {
            this.blenderPath = '';
            this.outputPath = '';
        }
    }

    /**
     * Generate complete entity from RSMV config with Evolution transformation
     * This is the PRIMARY method!
     */
    async generateFromEntity(options: {
        entityType: 'npc' | 'item' | 'loc' | 'player';
        entityId: number;
        era?: number;
        modifications?: {
            additionalColorShift?: number;
            rescale?: number;
        };
        outputName: string;
    }): Promise<{
        modelPath: string;
        config: RSMVEntityConfig;
        era: number;
    }> {
        if (typeof window !== 'undefined') {
            console.warn('[Hybrid] Cannot generate content in browser');
            return { modelPath: '', config: {}, era: 0 };
        }

        const era = options.era ?? 0;

        console.log(`[Hybrid] Generating ${options.entityType} #${options.entityId} for Era ${era} (${this.getEraName(era)})`);

        // Step 1: Get entity config from RSMV
        const entityConfig = await this.fetchEntityConfig(options.entityType, options.entityId);

        console.log(`[Hybrid] Entity: ${entityConfig.name || 'Unknown'}`);
        console.log(`[Hybrid] Models: ${entityConfig.models?.length || 0}`);

        // Step 2: Load all models from config
        const modelPaths = await Promise.all(
            (entityConfig.models || []).map(id => this.fetchModelFromRSMV(id))
        );

        // Step 3: Composite in Blender with Jagex colors/materials
        const compositePath = await this.compositeInBlender({
            modelPaths,
            colorReplacements: entityConfig.color_replacements || [],
            materialReplacements: entityConfig.material_replacements || [],
            additionalModifications: options.modifications,
            outputName: `${options.outputName}_base`
        });

        // Step 4: Evolution transformation
        const evolvedPath = await this.applyEvolutionTransform(
            compositePath,
            era,
            options.outputName
        );

        return {
            modelPath: evolvedPath,
            config: entityConfig,
            era
        };
    }

    /**
     * Fetch entity config from RSMV cache
     */
    private async fetchEntityConfig(
        type: 'npc' | 'item' | 'loc' | 'player',
        id: number
    ): Promise<RSMVEntityConfig> {
        // Dynamic imports to handle RSMV module
        const { GameCacheLoader } = await import('../../libs/rsmv/src/cache/sqlite');
        const { EngineCache, ThreejsSceneCache } = await import('../../libs/rsmv/src/3d/modeltothree');

        if (!this.rsmvCache) {
            // Use RS3 cache path (user has RS3 installed)
            const cachePath = (typeof process !== 'undefined' && process.env.RSMV_CACHE_PATH) ||
                'C:\\ProgramData\\Jagex\\RuneScape'; // RS3 cache location (contains .jcache files)

            console.log(`[RSMV] Loading cache from: ${cachePath}`);

            // Load RS3 cache but force classic model type for evolution system
            if (this.forceClassicModels) {
                console.log('[RSMV] Using model type: classic (forced for evolution)');
                const cacheLoader = new GameCacheLoader(cachePath, false);
                const engineCache = await EngineCache.create(cacheLoader);
                // Force classic model type (will use classic models if available in cache)
                this.rsmvCache = await ThreejsSceneCache.create(engineCache, 'auto', 'classic');
            } else {
                // Auto-detect model type (not recommended for evolution)
                const cacheLoader = new GameCacheLoader(cachePath, false);
                const engineCache = await EngineCache.create(cacheLoader);
                this.rsmvCache = await ThreejsSceneCache.create(engineCache);
            }
        }

        let config: any;
        switch (type) {
            case 'npc':
                config = await this.rsmvCache.engine.getGameFile('npcs', id);
                break;
            case 'item':
                config = await this.rsmvCache.engine.getGameFile('items', id);
                break;
            case 'loc':
                config = await this.rsmvCache.engine.getGameFile('objects', id);
                break;
            case 'player':
                config = {}; // Not implemented yet
                break;
        }

        return config as RSMVEntityConfig;
    }

    /**
     * Fetch single model from RSMV and export as OBJ
     */
    private async fetchModelFromRSMV(modelId: number): Promise<string> {
        if (typeof window !== 'undefined') return '';

        const path = (await import('path')).default;
        const fs = (await import('fs/promises')).default;
        const cwd = process.cwd();
        const outputPath = path.join(cwd, 'public', 'models', 'hybrid');

        // Use the already-initialized cache
        const modelData = await this.rsmvCache.getModelData(modelId);

        // Export to OBJ
        const objContent = this.modelDataToObj(modelData, `model_${modelId}`);

        const tempPath = path.join(outputPath, 'temp', `model_${modelId}.obj`);
        await fs.mkdir(path.dirname(tempPath), { recursive: true });
        await fs.writeFile(tempPath, objContent);

        return tempPath;
    }

    /**
     * Convert RSMV ModelData to OBJ format string
     */
    private modelDataToObj(modelData: any, objectName: string): string {
        let obj = `# RSMV Model Export: ${objectName}\n`;
        obj += `o ${objectName}\n`;

        let vertexOffset = 1;

        // Iterate through meshes
        for (const mesh of modelData.meshes) {
            const pos = mesh.attributes.pos;
            const normals = mesh.attributes.normals;
            const uvs = mesh.attributes.texuvs;
            const indices = mesh.indices;

            // Write Vertices
            for (let i = 0; i < pos.count; i++) {
                obj += `v ${pos.getX(i)} ${pos.getY(i)} ${pos.getZ(i)}\n`;
            }

            // Write UVs
            if (uvs) {
                for (let i = 0; i < uvs.count; i++) {
                    obj += `vt ${uvs.getX(i)} ${uvs.getY(i)}\n`;
                }
            }

            // Write Normals
            if (normals) {
                for (let i = 0; i < normals.count; i++) {
                    obj += `vn ${normals.getX(i)} ${normals.getY(i)} ${normals.getZ(i)}\n`;
                }
            }

            // Write Faces
            // OBJ indices are 1-based
            for (let i = 0; i < indices.count; i += 3) {
                const i1 = indices.getX(i) + vertexOffset;
                const i2 = indices.getX(i + 1) + vertexOffset;
                const i3 = indices.getX(i + 2) + vertexOffset;

                // Format: v/vt/vn
                // Assuming simplified export where indices match for v, vt, vn
                if (uvs && normals) {
                    obj += `f ${i1}/${i1}/${i1} ${i2}/${i2}/${i2} ${i3}/${i3}/${i3}\n`;
                } else if (uvs) {
                    obj += `f ${i1}/${i1} ${i2}/${i2} ${i3}/${i3}\n`;
                } else if (normals) {
                    obj += `f ${i1}//${i1} ${i2}//${i2} ${i3}//${i3}\n`;
                } else {
                    obj += `f ${i1} ${i2} ${i3}\n`;
                }
            }

            vertexOffset += pos.count;
        }

        return obj;
    }

    /**
     * Composite multiple models with Jagex color/material replacements
     */
    private async compositeInBlender(options: {
        modelPaths: string[];
        colorReplacements: [number, number][];
        materialReplacements: [number, number][];
        additionalModifications?: {
            additionalColorShift?: number;
            rescale?: number;
        };
        outputName: string;
    }): Promise<string> {
        if (typeof window !== 'undefined') return '';

        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const path = (await import('path')).default;
        const fs = (await import('fs/promises')).default;
        const execAsync = promisify(exec);

        const cwd = process.cwd();
        const outputPath = path.join(cwd, 'public', 'models', 'hybrid');

        const outputFile = path.join(outputPath, `${options.outputName}.glb`);
        await fs.mkdir(outputPath, { recursive: true });

        const scriptPath = path.join(cwd, 'blender-scripts', 'composite_entity.py');

        const command = [
            this.blenderPath,
            '--background',
            '--python', scriptPath,
            '--',
            '--models', options.modelPaths.join(','),
            '--color-replacements', JSON.stringify(options.colorReplacements),
            '--material-replacements', JSON.stringify(options.materialReplacements),
            '--additional-hue-shift', options.additionalModifications?.additionalColorShift || 0,
            '--rescale', options.additionalModifications?.rescale || 1.0,
            '--output', outputFile
        ].join(' ');

        try {
            await execAsync(command, { timeout: 60000 });
            return `/models/hybrid/${options.outputName}.glb`;
        } catch (error: any) {
            console.error('[Hybrid] Blender composite failed:', error);
            throw error;
        }
    }

    /**
     * Apply evolution transformation
     * Smooths geometry and adds god visuals for high eras
     */
    private async applyEvolutionTransform(
        baseModelPath: string,
        era: number,
        outputName: string
    ): Promise<string> {
        if (era === 0) {
            return baseModelPath;
        }
        if (typeof window !== 'undefined') return baseModelPath;

        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const path = (await import('path')).default;
        const execAsync = promisify(exec);

        const cwd = process.cwd();
        const outputPath = path.join(cwd, 'public', 'models', 'hybrid');

        const outputFile = path.join(outputPath, `${outputName}.glb`);
        const scriptPath = path.join(cwd, 'blender-scripts', 'evolution_transformer.py');

        const absoluteBasePath = path.isAbsolute(baseModelPath)
            ? baseModelPath
            : path.join(outputPath, baseModelPath);

        const command = [
            this.blenderPath,
            '--background',
            '--python', scriptPath,
            '--',
            '--input', absoluteBasePath,
            '--era', era.toString(),
            '--output', outputFile
        ].join(' ');

        try {
            await execAsync(command, { timeout: 60000 });
            console.log(`[Evolution] Transformed to Era ${era}: ${this.getEraName(era)}`);
            return `/models/hybrid/${outputName}.glb`;
        } catch (error: any) {
            console.error('[Evolution] Transform failed:', error);
            return baseModelPath;
        }
    }

    /**
     * Search entities by name
     */
    async searchEntities(
        type: 'npc' | 'item' | 'loc',
        searchTerm: string
    ): Promise<Array<{ id: number; name: string; config: RSMVEntityConfig }>> {
        const results: Array<{ id: number; name: string; config: RSMVEntityConfig }> = [];

        for (let id = 0; id < 10000; id++) {
            try {
                const config = await this.fetchEntityConfig(type, id);
                if (config.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
                    results.push({ id, name: config.name, config });
                }
                if (results.length >= 50) break;
            } catch (e) {
                // Skip invalid IDs
            }
        }

        return results;
    }

    /**
     * Get era name for logging
     */
    private getEraName(era: number): string {
        const names: Record<number, string> = {
            0: 'Caveman',
            1: 'Prehistoric',
            2: 'Ancient Village',
            3: 'Lost Civilization',
            4: 'Bronze Age',
            5: 'Iron Age',
            6: 'Classical',
            7: 'Medieval',
            8: 'Renaissance',
            9: 'Industrial',
            10: 'Atomic Age',
            11: 'Information Age',
            12: 'Deity/Godhood'
        };
        return names[era] || (era >= 12 ? 'Deity/Godhood' : 'Unknown');
    }
}

// Singleton instance
export const hybridGenerator = new HybridContentGenerator();
