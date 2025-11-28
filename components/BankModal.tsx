import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { X, Lock, Unlock, Plus } from 'lucide-react';

interface BankModalProps {
    bankStorage: InventoryItem[];
    playerInventory: InventoryItem[];
    aiInventory: InventoryItem[];
    bankTabs?: number;
    onClose: () => void;
    onDeposit: (from: 'player' | 'ai', itemId: string, amount: number | 'ALL') => void;
    onWithdraw: (itemId: string, amount: number | 'ALL', placeholderMode?: boolean) => void;
    onContextMenu: (item: InventoryItem, x: number, y: number) => void;
    onInventoryContextMenu: (item: InventoryItem, x: number, y: number) => void;
    onAddTab?: () => void;
    onMoveItem?: (itemId: string, toTab: number) => void;
}

export const BankModal: React.FC<BankModalProps> = ({
    bankStorage,
    playerInventory,
    aiInventory,
    bankTabs = 1,
    onClose,
    onDeposit,
    onWithdraw,
    onContextMenu,
    onInventoryContextMenu,
    onAddTab,
    onMoveItem
}) => {
    const [selectedTab, setSelectedTab] = useState<number | 'all'>('all');
    const [placeholderMode, setPlaceholderMode] = useState(false);

    // Filter items by tab
    const filteredBankStorage = selectedTab === 'all'
        ? bankStorage
        : bankStorage.filter(item => (item.tabIndex || 0) === selectedTab);

    const renderItem = (item: InventoryItem, onClick: () => void, onRightClick: (e: React.MouseEvent) => void, isPlaceholder?: boolean) => (
        <div
            className={`w-12 h-12 border-2 ${isPlaceholder ? 'border-yellow-500/50 bg-[#3e3529]/30' : 'border-[#5b5247] bg-[#3e3529]'} flex items-center justify-center cursor-pointer hover:bg-[#4e4336] relative`}
            onClick={onClick}
            onContextMenu={onRightClick}
            title={item.name}
        >
            <span className={`text-2xl drop-shadow-md ${isPlaceholder ? 'opacity-30' : ''}`}>{item.icon}</span>
            {item.count && item.count > 1 && !isPlaceholder && (
                <span className="absolute bottom-0 right-0 text-xs bg-black/80 text-yellow-400 px-1 font-bold pointer-events-none">
                    {item.count >= 1000000 ? `${(item.count / 1000000).toFixed(1)}M` : item.count >= 1000 ? `${(item.count / 1000).toFixed(1)}k` : item.count}
                </span>
            )}
            {isPlaceholder && (
                <Lock size={16} className="absolute top-1 right-1 text-yellow-500 opacity-60" />
            )}
        </div>
    );

    const renderGrid = (items: InventoryItem[], onItemClick: (item: InventoryItem) => void, onRightClick: (item: InventoryItem, x: number, y: number) => void, emptySlots: number = 28) => {
        const slots: (InventoryItem | null)[] = Array(emptySlots).fill(null);
        items.forEach((it, idx) => {
            if (idx < emptySlots) slots[idx] = it;
        });

        return (
            <div className="grid grid-cols-7 gap-1 p-2 bg-[#2b2319] border-2 border-[#5b5247]">
                {slots.map((item, i) => (
                    <div key={i}>
                        {item ? (
                            renderItem(
                                item,
                                () => onItemClick(item),
                                (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onRightClick(item, e.clientX, e.clientY);
                                },
                                item.isPlaceholder
                            )
                        ) : (
                            <div className="w-12 h-12 border-2 border-[#5b5247] bg-[#2b2319]" />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-auto" onClick={onClose}>
            <div className="bg-[#3e3529] border-[4px] border-[#5b5247] shadow-2xl flex" onClick={e => e.stopPropagation()}>
                {/* Left Sidebar - Tabs */}
                <div className="bg-[#2b2319] border-r-2 border-[#1a1510] w-16 flex flex-col items-center py-4 gap-2">
                    {/* Master View (All) */}
                    <button
                        onClick={() => setSelectedTab('all')}
                        className={`w-12 h-12 border-2 ${selectedTab === 'all' ? 'border-yellow-500 bg-yellow-500/20' : 'border-[#5b5247] bg-[#3e3529]'} flex items-center justify-center hover:bg-[#4e4336] text-xl font-bold text-[#ff981f]`}
                        title="All Items"
                    >
                        ∞
                    </button>

                    <div className="w-10 h-px bg-[#5b5247] my-1" />

                    {/* Tab Buttons */}
                    {Array.from({ length: bankTabs }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedTab(i)}
                            className={`w-12 h-12 border-2 ${selectedTab === i ? 'border-yellow-500 bg-yellow-500/20' : 'border-[#5b5247] bg-[#3e3529]'} flex items-center justify-center hover:bg-[#4e4336] text-sm font-bold text-zinc-400`}
                            title={`Tab ${i + 1}`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    {/* Add Tab Button */}
                    {onAddTab && (
                        <button
                            onClick={onAddTab}
                            className="w-12 h-12 border-2 border-[#5b5247] bg-[#3e3529] flex items-center justify-center hover:bg-green-900/30 hover:border-green-500"
                            title="Add New Tab"
                        >
                            <Plus size={20} className="text-green-500" />
                        </button>
                    )}
                </div>

                {/* Main Content */}
                <div>
                    {/* Header */}
                    <div className="bg-[#2b2319] p-3 flex justify-between items-center border-b-[2px] border-[#1a1510]">
                        <h2 className="text-[#ff981f] font-bold text-xl">
                            The Bank of RuneScape {selectedTab !== 'all' && `- Tab ${(selectedTab as number) + 1}`}
                        </h2>
                        <div className="flex gap-2">
                            {/* Placeholder Toggle */}
                            <button
                                onClick={() => setPlaceholderMode(!placeholderMode)}
                                className={`px-3 py-1 border-2 ${placeholderMode ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300' : 'border-[#5b5247] bg-[#3e3529] text-zinc-400'} flex items-center gap-2 hover:bg-[#4e4336] text-sm font-bold`}
                                title="Toggle Placeholder Mode"
                            >
                                {placeholderMode ? <Lock size={16} /> : <Unlock size={16} />}
                                {placeholderMode ? 'ON' : 'OFF'}
                            </button>
                            <button onClick={onClose} className="text-red-400 hover:text-red-200">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Three Column Layout */}
                    <div className="flex gap-4 p-4">
                        {/* Bank Storage */}
                        <div>
                            <h3 className="text-center mb-2 text-[#ff981f] font-bold text-sm">BANK STORAGE</h3>
                            {renderGrid(filteredBankStorage, (item) => onWithdraw(item.id, 1, placeholderMode), onContextMenu, 56)}
                            <div className="mt-2 text-center">
                                <span className="text-xs text-zinc-400">Right-click for options</span>
                            </div>
                        </div>

                        {/* Player Inventory */}
                        <div>
                            <h3 className="text-center mb-2 text-[#ff981f] font-bold text-sm">YOUR INVENTORY</h3>
                            {renderGrid(playerInventory, (item) => onDeposit('player', item.id, 1), onInventoryContextMenu, 28)}
                            <div className="mt-2 text-center">
                                <span className="text-xs text-zinc-400">Right-click to deposit</span>
                            </div>
                        </div>

                        {/* AI Inventory */}
                        <div>
                            <h3 className="text-center mb-2 text-[#ff981f] font-bold text-sm">COMPANION INVENTORY</h3>
                            {renderGrid(aiInventory, (item) => onDeposit('ai', item.id, 1), onInventoryContextMenu, 28)}
                            <div className="mt-2 text-center">
                                <span className="text-xs text-zinc-400">Right-click to deposit</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
