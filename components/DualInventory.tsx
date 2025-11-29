import React from 'react';
import { InventoryItem } from '../types';
import { soundManager } from '../services/soundManager';

interface DualInventoryProps {
    playerInventory: InventoryItem[];
    aiInventory: InventoryItem[];
    onTransfer: (from: 'player' | 'ai', itemId: string, amount: number | 'ALL') => void;
}

export const DualInventory: React.FC<DualInventoryProps> = ({ playerInventory, aiInventory, onTransfer }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, source: 'player' | 'ai', item: InventoryItem) => {
        const data = JSON.stringify({ source, itemId: item.id, amount: item.count ?? 1 });
        e.dataTransfer.setData('application/json', data);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, target: 'player' | 'ai') => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;
        const { source, itemId, amount } = JSON.parse(data);
        if (source !== target) {
            soundManager.init();
            soundManager.play('DROP_OBJECT');
            onTransfer(source, itemId, amount);
        }
    };

    const renderSlot = (item: InventoryItem | null, source: 'player' | 'ai') => {
        if (!item) {
            return <div className="w-12 h-12 border-2 border-[#5b5247] bg-[#2b2319]" />;
        }
        return (
            <div
                className="w-12 h-12 border-2 border-[#5b5247] bg-[#3e3529] flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-[#4e4336] relative"
                draggable
                onDragStart={e => handleDragStart(e, source, item)}
                title={item.name}
            >
                <span className="text-2xl drop-shadow-md">{item.icon}</span>
                {item.count && item.count > 1 && (
                    <span className="absolute bottom-0 right-0 text-xs bg-black/80 text-yellow-400 px-1 font-bold pointer-events-none">
                        {item.count}
                    </span>
                )}
            </div>
        );
    };

    const rows = 4;
    const cols = 7;
    const renderGrid = (items: InventoryItem[], source: 'player' | 'ai') => {
        const slots: (InventoryItem | null)[] = Array(rows * cols).fill(null);
        items.forEach((it, idx) => (slots[idx] = it));
        return (
            <div
                className="grid grid-cols-7 gap-1 p-2 bg-[#2b2319] border-2 border-[#5b5247]"
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, source)}
            >
                {slots.map((it, i) => (
                    <React.Fragment key={i}>{renderSlot(it, source)}</React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className="flex gap-4">
            <div>
                <h3 className="text-center mb-2 text-[#ff981f] font-bold">Your Inventory</h3>
                {renderGrid(playerInventory, 'player')}
            </div>
            <div>
                <h3 className="text-center mb-2 text-[#ff981f] font-bold">Companion Inventory</h3>
                {renderGrid(aiInventory, 'ai')}
            </div>
        </div>
    );
};
