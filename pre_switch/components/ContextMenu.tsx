
import React from 'react';
import { ContextMenuState } from '../types';

interface ContextMenuProps {
    menu: ContextMenuState;
    onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ menu, onClose }) => {
    return (
        <div 
            className="absolute z-[99999] bg-[#1e1e1e] border border-[#555] shadow-[4px_4px_10px_rgba(0,0,0,0.8)] min-w-[160px] flex flex-col pointer-events-auto font-vt323 text-white"
            style={{ left: menu.x, top: menu.y }}
            onClick={(e) => e.stopPropagation()} 
        >
            <div className="bg-[#333] text-yellow-500 px-2 py-1 border-b border-[#555] text-sm font-bold truncate max-w-[200px] tracking-wider uppercase">
                {menu.title}
            </div>
            {menu.options.map((opt, i) => (
                <button
                    key={i}
                    onClick={() => {
                        opt.action();
                        onClose();
                    }}
                    className={`
                        text-left px-3 py-2 text-sm hover:bg-[#444] transition-colors flex items-center gap-2 border-b border-[#2a2a2a] last:border-0
                        ${opt.variant === 'danger' ? 'text-red-400 hover:text-red-300' : 'text-zinc-300 hover:text-white'}
                        ${opt.variant === 'primary' ? 'text-cyan-400 font-bold' : ''}
                    `}
                >
                    {opt.label}
                </button>
            ))}
            <button 
                onClick={onClose}
                className="text-left px-3 py-1 text-xs text-zinc-500 hover:bg-[#252525] hover:text-zinc-400 bg-[#111]"
            >
                Cancel
            </button>
        </div>
    );
};
