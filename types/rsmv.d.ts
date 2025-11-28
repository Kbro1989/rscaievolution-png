/**
 * Type definitions for RSMV (RuneApps Model Viewer)
 * Re-exporting types from the actual RSMV library
 */

// Export main cache and API types from RSMV
declare module '../../libs/rsmv/dist/api' {
    export { CacheFileSource } from '../../libs/rsmv/src/cache';
    export { EngineCache, ThreejsSceneCache } from '../../libs/rsmv/src/3d/modeltothree';
    export { RSModel, itemToModel, npcToModel, locToModel, modelToModel } from '../../libs/rsmv/src/3d/modelnodes';
    export { CacheDownloader } from '../../libs/rsmv/src/cache/downloader';
    export { GameCacheLoader } from '../../libs/rsmv/src/cache/sqlite';
    export { ClassicFileSource } from '../../libs/rsmv/src/cache/classicloader';
}

// Re-export generated RSMV entity types
declare module '../../libs/rsmv/generated/items' {
    export type { items } from '../../libs/rsmv/generated/items.d.ts';
}

declare module '../../libs/rsmv/generated/npcs' {
    export type { npcs } from '../../libs/rsmv/generated/npcs.d.ts';
}

declare module '../../libs/rsmv/generated/objects' {
    export type { objects } from '../../libs/rsmv/generated/objects.d.ts';
}

declare module '../../libs/rsmv/generated/models' {
    export type { models } from '../../libs/rsmv/generated/models.d.ts';
}

declare module '../../libs/rsmv/generated/classicmodels' {
    export type { classicmodels } from '../../libs/rsmv/generated/classicmodels.d.ts';
}
