import { GameResponse, PlayerState, WorldState, SkillName, GlobeState, XPDrop } from '../../types';

export interface IWorldEngine {
    db: {
        player: PlayerState;
        world: WorldState;
        globe: GlobeState;
    };
    router(path: string, body: any, isSimulated?: boolean): Promise<GameResponse>;
    addXP(player: PlayerState, skill: SkillName, amount: number): void;
}
