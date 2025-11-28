import React from 'react';
import { PlayerState } from '../types';

export function SlayerTaskWidget({ player }: { player: PlayerState }) {
    if (!player.slayerTask) return null;

    const { monster, remaining, assigned } = player.slayerTask;
    const progress = ((assigned - remaining) / assigned) * 100;

    return (
        <div className="absolute top-20 left-4 bg-black/80 border border-yellow-600/50 p-3 rounded text-yellow-100 font-serif w-64 pointer-events-none select-none z-10">
            <div className="text-sm text-yellow-500 font-bold mb-1 flex justify-between items-center">
                <span>📜 Slayer Task</span>
                <span className="text-xs text-yellow-600">{Math.round(progress)}%</span>
            </div>
            <div className="text-lg text-white mb-1">{monster}</div>
            <div className="text-xs text-yellow-400 mb-2">{remaining} more to kill</div>

            <div className="w-full h-2 bg-black border border-yellow-900 rounded overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-red-900 to-red-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
