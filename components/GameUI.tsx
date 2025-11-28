
import React, { useEffect, useRef, useState } from 'react';
import { PlayerState, InventoryItem, AIState, AIEquipment, LogMessage, ResourceEntity, NPC, WorldState, ContextMenuState, QuestCompletion, Spell, SkillName, CombatStyle, Recipe, XPDrop, Skill } from '../types';
import { SPELLS, SKILL_GUIDES, SKILL_REGISTRY, SKILL_DEFINITIONS, backend, ERA_DATA, PRAYERS } from '../services/gameBackend';
import {
    Backpack, Shield, Zap, Settings, X,
    Sword, Crown, Map as MapIcon,
    User, Heart, Star, ChevronUp, ChevronDown,
    Plus, Minus, Music, LogOut, Maximize, Minimize,
    Globe as GlobeIcon, Crosshair, Hammer, Pickaxe, ChefHat, HardHat, Sun, Speaker, Volume2, Activity as ActivityIcon,
    Play, Pause, ShoppingBag, Landmark
} from 'lucide-react';
import { ContextMenu } from './ContextMenu';
import { DualInventory } from './DualInventory';
import { BankModal } from './BankModal';
import { EquipmentToggle } from './EquipmentToggle';
import { soundManager } from '../services/soundManager';
import { SlayerTaskWidget } from './SlayerTaskWidget';
import { GronkSkillPanel } from './GronkSkillPanel';

const COLORS = {
    bg: '#3e3529',
    bgDark: '#2b2319',
    border: '#5b5247',
    borderDark: '#1a1510',
    text: '#ff981f',
    textYellow: '#ffff00',
    textWhite: '#ffffff',
};

// --- SUB-COMPONENTS ---

const XPDropsContainer = ({ drops }: { drops: XPDrop[] }) => {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[60] flex flex-col items-center">
            {drops.map((d, i) => (
                <div key={i} className="animate-float-up text-center mb-1 drop-shadow-md">
                    <div className="bg-blue-900/80 border border-blue-500 rounded-full px-3 py-1 text-white font-bold text-lg flex items-center gap-2">
                        <span className="text-yellow-300">+{d.amount}</span>
                        <span className="text-xs uppercase">{d.skill}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

const Minimap = ({ player, resources, npcs, onRotate, onZoom }: { player: PlayerState, resources: ResourceEntity[], npcs: NPC[], onRotate: any, onZoom: any }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 160, 160);
        const SCALE = 4; const CENTER = 80;
        ctx.strokeStyle = '#222'; ctx.lineWidth = 1; ctx.beginPath();
        for (let i = 0; i < 160; i += 20) { ctx.moveTo(i, 0); ctx.lineTo(i, 160); ctx.moveTo(0, i); ctx.lineTo(160, i); }
        ctx.stroke();
        resources.forEach(r => {
            if (!r.active) return;
            const dx = (r.position.x - player.position.x) * SCALE;
            const dy = (r.position.z - player.position.z) * SCALE;
            if (Math.abs(dx) < 80 && Math.abs(dy) < 80) {
                if (r.type === 'BANK_BOOTH') ctx.fillStyle = '#f1c40f';
                else if (r.type === 'PORTAL') ctx.fillStyle = '#a855f7';
                else ctx.fillStyle = r.type === 'TREE' || r.type === 'PALM_TREE' ? '#005f00' : r.type === 'ROCK' ? '#555' : '#ff0000';
                ctx.fillRect(CENTER + dx - 2, CENTER + dy - 2, 4, 4);
            }
        });
        npcs.forEach(n => {
            const dx = (n.position.x - player.position.x) * SCALE;
            const dy = (n.position.z - player.position.z) * SCALE;
            if (Math.abs(dx) < 80 && Math.abs(dy) < 80) {
                ctx.fillStyle = n.role === 'PLAYER_BOT' ? '#ffffff' : '#ffff00';
                ctx.beginPath(); ctx.arc(CENTER + dx, CENTER + dy, 3, 0, Math.PI * 2); ctx.fill();
            }
        });
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(CENTER, CENTER, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#d90429'; ctx.font = 'bold 12px serif'; ctx.fillText('N', 75, 15);
    }, [player.position, resources, npcs]);
    return (
        <div className="w-[170px] h-[170px] bg-[#3e3529] border-[3px] border-[#1a1510] rounded-full relative flex items-center justify-center shadow-xl pointer-events-auto">
            <div className="w-[150px] h-[150px] rounded-full overflow-hidden border-2 border-[#2b2319] bg-black"><canvas ref={canvasRef} width={160} height={160} /></div>
            <div className="absolute -right-2 top-8 flex flex-col gap-1">
                <button onClick={() => onZoom('IN')} className="w-6 h-6 bg-[#3e3529] border border-[#1a1510] flex items-center justify-center text-[#ff981f] hover:text-white"><Plus size={12} /></button>
                <button onClick={() => onZoom('OUT')} className="w-6 h-6 bg-[#3e3529] border border-[#1a1510] flex items-center justify-center text-[#ff981f] hover:text-white"><Minus size={12} /></button>
            </div>
        </div>
    );
};

const ItemSlot = ({ item, index, isActive, onClick, onContextMenu, shopMode, isBank, onDragStart, onDragOver, onDrop }: any) => (
    <div
        onClick={() => onClick(item, index)}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); if (item) onContextMenu(item, e.nativeEvent.clientX, e.nativeEvent.clientY); }}
        draggable={!!item}
        onDragStart={(e) => item && onDragStart && onDragStart(e, item, index)}
        onDragOver={(e) => onDragOver && onDragOver(e)}
        onDrop={(e) => onDrop && onDrop(e, index)}
        className={`w-[36px] h-[32px] flex items-center justify-center relative cursor-pointer ${isActive ? 'outline outline-2 outline-white bg-white/20' : ''} ${shopMode ? 'border border-[#ff981f]/30' : ''} ${isBank ? 'bg-[#40362c] border border-[#2b2319]' : ''} hover:bg-white/10`}
    >
        {item ? (<><span className="text-2xl drop-shadow-md filter">{item.icon}</span>{item.count > 1 && (<span className="absolute -top-1 left-0 text-[10px] text-yellow-300 font-bold drop-shadow-md">{item.count >= 1000000 ? `${(item.count / 1000000).toFixed(1)}M` : item.count >= 1000 ? `${(item.count / 1000).toFixed(1)}k` : item.count}</span>)}</>) : null}
    </div>
);

const TabButton = ({ icon: Icon, active, onClick, alert }: any) => (
    <button onClick={onClick} className={`flex-1 h-[35px] flex items-center justify-center border-r border-b border-[#1a1510] relative ${active ? 'bg-[#4e4336]' : 'bg-[#352d24] hover:bg-[#3e3529]'}`}>
        <Icon size={18} color={active ? '#ffffff' : '#9eaab6'} />{alert && <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
    </button>
);

// Quantity Selector Component
const QuantitySelector = ({ item, onSelect, onClose, mode }: { item: InventoryItem, onSelect: (qty: number | 'ALL') => void, onClose: () => void, mode: 'DEPOSIT' | 'WITHDRAW' | 'BUY' | 'SELL' }) => {
    const [customQty, setCustomQty] = useState('');
    const maxQty = item.count;

    const handleSelect = (qty: number | 'ALL') => {
        onSelect(qty);
        onClose();
    };

    return (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-[#3e3529] border-[3px] border-[#5b5247] p-4 shadow-2xl min-w-[250px]" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-3">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-sm text-[#ff981f] font-bold">{item.name}</div>
                    <div className="text-xs text-zinc-400">{mode} Quantity (Max: {maxQty})</div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {[1, 5, 10].map(qty => (
                        <button
                            key={qty}
                            onClick={() => handleSelect(Math.min(qty, maxQty))}
                            disabled={qty > maxQty}
                            className="px-3 py-2 bg-[#2b2319] border border-[#5b5247] text-white text-sm font-bold hover:bg-[#4e4336] disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            {qty}
                        </button>
                    ))}
                    <button
                        onClick={() => {
                            const input = prompt('Enter quantity:', '');
                            if (input) {
                                const qty = Math.min(parseInt(input) || 1, maxQty);
                                handleSelect(qty);
                            }
                        }}
                        className="px-3 py-2 bg-[#2b2319] border border-[#5b5247] text-white text-sm font-bold hover:bg-[#4e4336]"
                    >
                        X
                    </button>
                    <button
                        onClick={() => handleSelect('ALL')}
                        className="col-span-2 px-3 py-2 bg-[#2b2319] border border-[#5b5247] text-white text-sm font-bold hover:bg-[#4e4336]"
                    >
                        ALL ({maxQty})
                    </button>
                </div>
                <button onClick={onClose} className="w-full py-1 bg-red-900/50 hover:bg-red-900/70 text-white text-xs">Cancel</button>
            </div>
        </div>
    );
};


const ShopModal = ({ stock, onClose, onBuy }: { stock: InventoryItem[], onClose: () => void, onBuy: (item: InventoryItem) => void }) => (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-auto" onClick={onClose}>
        <div className="w-[400px] bg-[#3e3529] border-[4px] border-[#5b5247] shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[#2b2319] p-2 flex justify-between items-center border-b-[2px] border-[#1a1510]">
                <div className="flex items-center gap-2 text-[#ff981f] font-bold text-lg"><ShoppingBag size={20} /> GENERAL STORE</div>
                <button onClick={onClose} className="text-red-400 hover:text-red-200"><X size={20} /></button>
            </div>
            <div className="p-2 grid grid-cols-5 gap-2 bg-[#2b2319]">
                {stock.map((item, i) => (
                    <div key={i} onClick={() => onBuy(item)} className="flex flex-col items-center bg-[#3e3529] border border-[#5b5247] p-1 cursor-pointer hover:bg-[#4e4336]">
                        <span className="text-2xl drop-shadow-md">{item.icon}</span>
                        <span className="text-[10px] text-yellow-500 mt-1">{item.price || 10}gp</span>
                    </div>
                ))}
            </div>
            <div className="p-2 bg-[#3e3529] text-xs text-center border-t border-[#5b5247] text-zinc-400">
                Click items in your inventory to SELL. Click shop items to BUY.
            </div>
        </div>
    </div>
);

const SkillGuideModal = ({ skill, onClose }: { skill: SkillName, onClose: () => void }) => {
    // Merge static guide data with definition data
    const guideData = SKILL_GUIDES[skill] || [];
    const definition = SKILL_DEFINITIONS[skill];

    return (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onClose}>
            <div className="w-[400px] bg-[#e6cca0] border-[4px] border-[#5b5247] shadow-2xl flex flex-col font-serif" onClick={(e) => e.stopPropagation()}>
                <div className="bg-[#4e4336] p-2 flex justify-between items-center border-b-[2px] border-[#3e2723]"><span className="text-yellow-400 font-bold text-lg drop-shadow-md tracking-wider">{definition.name} GUIDE</span><button onClick={onClose} className="text-red-400 hover:text-red-200"><X size={20} /></button></div>
                <div className="p-2 bg-[#d7b587] text-xs text-[#3e2723] border-b border-[#c8aa7e]">
                    Unlocked at Era: <b>{ERA_DATA.find(e => e.id === definition.eraUnlocked)?.name || definition.eraUnlocked}</b> | Max Level: <b>{definition.maxLevel}</b>
                </div>
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-1 bg-[#e6cca0]">
                    {/* Items from definition */}
                    {definition.items.map((item, idx) => (
                        <div key={`unlock-${idx}`} className={`flex items-center p-2 border-b border-[#c8aa7e] bg-[#e6cca0]`}>
                            <div className="w-10 text-center font-bold text-[#3e2723]">?</div>
                            <div className="flex-1 pl-2 border-l border-[#c8aa7e] text-[#3e2723] font-bold">{item}</div>
                        </div>
                    ))}
                    {/* Manual Guide Data */}
                    {guideData.map((item, idx) => (<div key={idx} className={`flex items-center p-2 border-b border-[#c8aa7e] ${idx % 2 === 0 ? 'bg-[#e6cca0]' : 'bg-[#d7b587]'}`}><div className="w-10 text-center font-bold text-[#3e2723]">{item.level}</div><div className="flex-1 flex items-center gap-3 pl-2 border-l border-[#c8aa7e]"><div className="text-2xl drop-shadow-sm">{item.icon}</div><div className="flex flex-col"><span className="font-bold text-[#3e2723] leading-tight">{item.name}</span>{item.description && <span className="text-xs text-[#5d4037]">{item.description}</span>}</div></div></div>))}
                </div>
            </div>
        </div>
    );
};

const QuestCompleteModal = ({ data, onClose }: { data: QuestCompletion, onClose: () => void }) => (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 pointer-events-auto">
        <div className="relative w-full max-w-md bg-[#e6cca0] border-4 border-[#5c4033] shadow-[0_0_50px_rgba(255,215,0,0.3)] p-8 text-[#3e2723] font-serif transform scale-100 animate-in zoom-in-95 duration-300">
            <div className="absolute -top-6 right-8 w-16 h-16 bg-red-800 rounded-full border-4 border-red-900 shadow-lg flex items-center justify-center text-red-900 font-bold text-2xl rotate-12">RSC</div>
            <div className="text-center border-b-2 border-[#8d6e63] pb-4 mb-4"><div className="text-sm font-bold tracking-widest uppercase text-[#5d4037] mb-1">Quest Completed</div><h2 className="text-3xl font-bold text-[#3e2723]">{data.title}</h2></div>
            <div className="text-lg italic text-center mb-6 leading-relaxed">"{data.description}"</div>
            <div className="bg-[#d7b587]/30 p-4 rounded border border-[#ccb088]"><div className="text-sm font-bold uppercase mb-2 text-center text-[#5d4037] underline decoration-dotted">Rewards Granted</div><ul className="space-y-1">{data.rewards.map((r, i) => (<li key={i} className="flex items-center gap-2 text-sm font-bold"><span className="text-green-700">✓</span> {r}</li>))}</ul></div>
            <button onClick={onClose} className="mt-6 w-full py-3 bg-[#5c4033] hover:bg-[#4a332a] text-[#e6cca0] font-bold uppercase tracking-widest border-2 border-[#3e2723] shadow-md transition-all active:translate-y-1">Collect Reward</button>
        </div>
    </div>
);

const getBonus = (eq: any, stat: string) => {
    let total = 0;
    Object.values(eq).forEach((item: any) => { if (item && item.stats && item.stats[stat]) total += item.stats[stat]; });
    return total;
};

// --- GRONK SKILL ACTIONS ---
const GRONK_SKILL_ACTIONS = {
    WOODCUTTING: [{ label: 'Normal Trees', cmd: 'chop trees' }, { label: 'Oak Trees', cmd: 'chop oak' }, { label: 'Willow Trees', cmd: 'chop willow' }, { label: 'Maple Trees', cmd: 'chop maple' }, { label: 'Yew Trees', cmd: 'chop yew' }, { label: '🤖 Auto (AI Decides)', cmd: 'gather wood' }],
    MINING: [{ label: 'Copper Ore', cmd: 'mine copper' }, { label: 'Tin Ore', cmd: 'mine tin' }, { label: 'Iron Ore', cmd: 'mine iron' }, { label: 'Coal', cmd: 'mine coal' }, { label: 'Mithril Ore', cmd: 'mine mithril' }, { label: 'Adamant Ore', cmd: 'mine adamant' }, { label: '🤖 Auto (AI Decides)', cmd: 'mine rocks' }],
    FISHING: [{ label: 'Net Fishing (Shrimp)', cmd: 'fish shrimp' }, { label: 'Bait Fishing', cmd: 'fish bait' }, { label: 'Cage Fishing', cmd: 'fish cage' }, { label: 'Harpoon Fishing', cmd: 'fish harpoon' }, { label: 'Shark Fishing', cmd: 'fish shark' }, { label: '🤖 Auto (AI Decides)', cmd: 'fish' }],
    ATTACK: [{ label: 'Chickens', cmd: 'kill chickens' }, { label: 'Cows', cmd: 'kill cows' }, { label: 'Goblins', cmd: 'kill goblins' }, { label: 'Giant Rats', cmd: 'kill rats' }, { label: 'Guards', cmd: 'kill guards' }, { label: '🤖 Auto (AI Decides)', cmd: 'hunt' }],
    STRENGTH: [{ label: '🤖 Auto Combat', cmd: 'hunt' }],
    DEFENSE: [{ label: '🤖 Auto Combat', cmd: 'hunt' }],
    HITS: [{ label: '(Passive Skill)', cmd: '' }],
    PRAYER: [{ label: '(Use Bones in Inv)', cmd: '' }],
    COOKING: [{ label: '(Manual Crafting Only)', cmd: '' }],
    SMITHING: [{ label: '(Manual Crafting Only)', cmd: '' }],
    CRAFTING: [{ label: '(Manual Crafting Only)', cmd: '' }],
    FIREMAKING: [{ label: '(Manual Crafting Only)', cmd: '' }],
    MAGIC: [{ label: '🤖 Auto Casting', cmd: 'use magic' }],
    FLETCHING: [{ label: '(Manual Crafting Only)', cmd: '' }],
    EVOLUTION: [{ label: '(Passive XP)', cmd: '' }],
};

const sendAICommand = (command: string) => {
    if (!command) return;
    const evt = new CustomEvent('chat-submit', { detail: { message: command, channel: 'AI-CMD' } });
    window.dispatchEvent(evt);
};

// --- MAIN UI COMPONENT ---

interface GameUIProps {
    children?: React.ReactNode;
    player: PlayerState;
    ai: AIState;
    world: WorldState;
    logs: LogMessage[];
    contextMenu: ContextMenuState | null;
    activeItem: InventoryItem | null;
    shopOpen: boolean;
    shopStock: InventoryItem[];
    bankOpen: boolean;
    questPopup: QuestCompletion | null;
    hoverText: string;
    hoverColor: string;
    productionMenu?: { skill: string, recipes: Recipe[] } | null;
    onCraft: (recipeId: string) => void;
    onCloseProduction: () => void;
    onCloseModal: () => void;
    onShopAction: (action: string, itemId: string) => void;
    onBankAction: (action: string, itemId: string, amount: number | 'ALL') => void;
    onTransferItem?: (from: 'PLAYER' | 'AI', to: 'PLAYER' | 'AI', itemId: string, index: number) => void;
    onItemClick: (item: InventoryItem | null, index?: number) => void;
    onContextMenu: (item: InventoryItem, x: number, y: number) => void;
    onCastSpell: (spellId: string) => void;
    onRotateCamera: (dir: 'LEFT' | 'RIGHT') => void;
    onZoomCamera: (dir: 'IN' | 'OUT') => void;
    onAdminAction: (action: string) => void;
    onToggleMap: () => void;
    onSetCombatStyle: (style: CombatStyle) => void;
    onToggleAIEquipment: (slot: keyof AIEquipment, enabled: boolean) => void;
    xpDrops?: XPDrop[];
    setGameState: React.Dispatch<React.SetStateAction<any>>;
    onLog: (text: string, sender?: string, type?: any) => void;
    onContextMenuShow: (menu: ContextMenuState) => void;
}

export const GameUI: React.FC<GameUIProps> = (props) => {
    const { player, ai, world, logs, children, hoverText, hoverColor, xpDrops, setGameState } = props;
    const [activeTab, setActiveTab] = useState<'INV' | 'EQUIP' | 'PRAYER' | 'MAGIC' | 'COMBAT' | 'STATS' | 'QUEST' | 'FRIENDS' | 'SETTINGS' | 'ADMIN'>('INV');
    // Separate tab state for AI Companion HUD to avoid interfering with main UI (chat, player tabs)
    const [aiActiveTab, setAIActiveTab] = useState<'AI_SKILLS' | 'AI_INV' | 'AI_EQUIP' | 'AI_PRAYER' | 'AI_MAGIC' | 'AI_COMBAT' | 'AI_CHAT'>('AI_SKILLS');
    const [chatInput, setChatInput] = useState("");
    const [activeChannel, setActiveChannel] = useState<'PUBLIC' | 'PRIVATE' | 'FRIENDS' | 'AI-CMD'>('PUBLIC');
    const [minimized, setMinimized] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);
    const [showSkillGuide, setShowSkillGuide] = useState<SkillName | null>(null);
    const [volume, setVolume] = useState(0.5);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent, source: 'PLAYER' | 'AI', item: InventoryItem, index: number) => {
        e.dataTransfer.setData('source', source);
        e.dataTransfer.setData('itemId', item.id);
        e.dataTransfer.setData('index', index.toString());
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, target: 'PLAYER' | 'AI', targetIndex?: number) => {
        e.preventDefault();
        const source = e.dataTransfer.getData('source') as 'PLAYER' | 'AI';
        const itemId = e.dataTransfer.getData('itemId');
        const sourceIndex = parseInt(e.dataTransfer.getData('index'));

        if (source === target) return; // No re-ordering within same inventory for now
        if (props.onTransferItem) {
            props.onTransferItem(source, target, itemId, sourceIndex);
        }
    };

    useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [logs]);

    const submitChat = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        // Parse commands and route to appropriate channel
        let channel = activeChannel;
        let message = chatInput;

        // Handle special prefixes
        if (chatInput.startsWith('/w ')) {
            channel = 'PRIVATE';
        } else if (chatInput.startsWith('/f ')) {
            channel = 'FRIENDS';
            message = chatInput.substring(3);
        } else if (chatInput.startsWith('/ai ')) {
            channel = 'AI-CMD';
        }

        const event = new CustomEvent('chat-submit', { detail: { message, channel } });
        window.dispatchEvent(event);
        setChatInput("");
    };

    const handleStatClick = (skill: SkillName) => setShowSkillGuide(skill);

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                setIsFullscreen(true);
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                    setIsFullscreen(false);
                }
            }
        } catch (err) {
            console.error("Fullscreen error:", err);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        soundManager.setVolume(val);
    };

    const toggleSim = () => {
        backend.post('/admin/toggle_sim', {}).then(res => {
            if (res.state?.autoPilot) soundManager.play('UI_CLICK');
        });
    };

    const togglePrayer = (pid: string) => {
        backend.post('/action/toggle_prayer', { prayerId: pid }).then(res => {
            if (res.state) {
                // Handled by parent
            }
        });
    };

    return (
        <div className="relative w-full h-full pointer-events-none select-none">
            {children}

            {xpDrops && xpDrops.length > 0 && <XPDropsContainer drops={xpDrops} />}

            {/* Top Left: Minimap & Compass */}
            <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2 pointer-events-auto">
                <div className="flex items-center gap-2 mb-1">
                    <div className="bg-black/50 text-white px-2 py-1 rounded text-xs font-mono border border-zinc-700">
                        XP: {Object.values(player.skills).reduce((a: number, b: Skill) => a + (b?.xp || 0), 0).toLocaleString()} | LVL: {player.combatLevel}
                    </div>
                    <button onClick={props.onToggleMap} className="bg-[#3e3529] border border-[#5b5247] p-1 rounded hover:bg-[#4e4336] text-[#ff981f]"><GlobeIcon size={20} /></button>
                </div>
                <Minimap player={player} resources={world.resources} npcs={world.npcs} onRotate={props.onRotateCamera} onZoom={props.onZoomCamera} />

                <div className="text-xs text-yellow-500 font-bold bg-black/60 px-2 rounded mt-1 border border-yellow-800/50">
                    ERA: {(ERA_DATA.find(e => e.id === player.era)?.name || 'UNKNOWN').toUpperCase()}
                </div>
            </div>

            {/* Hover Text */}
            {hoverText && (
                <div className="absolute top-4 left-4 z-50 pointer-events-none">
                    <div className="text-lg font-bold drop-shadow-[2px_2px_0_#000]" style={{ color: hoverColor }}>
                        {hoverText}
                    </div>
                </div>
            )}

            {/* Simulation Active Indicator */}
            {player.autoPilot && (
                <div className="absolute top-16 left-4 z-10 pointer-events-none animate-pulse">
                    <div className="text-2xl font-bold text-red-500 bg-black/50 px-3 py-1 border border-red-500 rounded flex items-center gap-2">
                        <ActivityIcon /> AUTO-PILOT ENGAGED
                    </div>
                </div>
            )}

            {/* Slayer Task Widget */}
            <SlayerTaskWidget player={player} />

            {/* Bottom Left: Player Interface */}
            <div className={`absolute bottom-2 right-2 z-20 pointer-events-auto transition-transform duration-300 ${minimized ? 'translate-y-[280px]' : ''}`}>
                <div className="w-[240px] h-[320px] bg-[#3e3529] border-[4px] border-[#2b2319] shadow-2xl flex flex-col relative">
                    {/* Tab Headers */}
                    <div className="flex flex-wrap bg-[#2b2319]">
                        <TabButton icon={Backpack} active={activeTab === 'INV'} onClick={() => setActiveTab('INV')} />
                        <TabButton icon={Shield} active={activeTab === 'EQUIP'} onClick={() => setActiveTab('EQUIP')} />
                        <TabButton icon={Star} active={activeTab === 'PRAYER'} onClick={() => setActiveTab('PRAYER')} />
                        <TabButton icon={Zap} active={activeTab === 'MAGIC'} onClick={() => setActiveTab('MAGIC')} />
                        <TabButton icon={Sword} active={activeTab === 'COMBAT'} onClick={() => setActiveTab('COMBAT')} />
                        <TabButton icon={ActivityIcon} active={activeTab === 'STATS'} onClick={() => setActiveTab('STATS')} />
                        <TabButton icon={MapIcon} active={activeTab === 'QUEST'} onClick={() => setActiveTab('QUEST')} alert={player.quest.stage === 0} />
                        <TabButton icon={Settings} active={activeTab === 'SETTINGS'} onClick={() => setActiveTab('SETTINGS')} />
                        {player.isAdmin && <TabButton icon={Crown} active={activeTab === 'ADMIN'} onClick={() => setActiveTab('ADMIN')} />}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-2 overflow-y-auto custom-scrollbar bg-[#3e3529] relative">
                        {activeTab === 'INV' && (
                            <div className="grid grid-cols-4 gap-1"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, 'PLAYER')}
                            >
                                {player.inventory.map((item, i) => (
                                    <ItemSlot
                                        key={i}
                                        item={item}
                                        index={i}
                                        isActive={props.activeItem?.id === item.id}
                                        onClick={props.onItemClick}
                                        onContextMenu={props.onContextMenu}
                                        draggable
                                        onDragStart={(e: React.DragEvent) => handleDragStart(e, 'PLAYER', item, i)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e: React.DragEvent) => handleDrop(e, 'PLAYER', i)}
                                    />
                                ))}
                                {[...Array(Math.max(0, 28 - player.inventory.length))].map((_, i) => (
                                    <div key={`empty-${i}`} className="w-[36px] h-[32px] bg-[#332b22] border border-[#4e4336] opacity-50"
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, 'PLAYER')}
                                    />
                                ))}
                            </div>
                        )}

                        {activeTab === 'EQUIP' && (
                            <div className="flex flex-col items-center gap-2 pt-2">
                                <div className="relative w-[160px] h-[200px] bg-[#2b2319] rounded border border-[#4e4336] p-2">
                                    <div className="absolute top-2 left-1/2 -translate-x-1/2"><EquipSlot item={player.equipment.head} placeholder="🧢" /></div>
                                    <div className="absolute top-14 left-1/2 -translate-x-1/2"><EquipSlot item={player.equipment.neck} placeholder="📿" /></div>
                                    <div className="absolute top-24 left-1/2 -translate-x-1/2"><EquipSlot item={player.equipment.body} placeholder="👕" /></div>
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2"><EquipSlot item={player.equipment.legs} placeholder="👖" /></div>
                                    <div className="absolute top-24 left-2"><EquipSlot item={player.equipment.mainHand} placeholder="⚔️" /></div>
                                    <div className="absolute top-24 right-2"><EquipSlot item={player.equipment.offHand} placeholder="🛡️" /></div>
                                    <div className="absolute bottom-14 left-2"><EquipSlot item={player.equipment.hands} placeholder="🧤" /></div>
                                    <div className="absolute bottom-14 right-2"><EquipSlot item={player.equipment.feet} placeholder="👢" /></div>
                                </div>
                                <div className="bg-[#222] w-full p-2 text-[10px] grid grid-cols-2 gap-x-2 text-zinc-400">
                                    <span>ATK: {getBonus(player.equipment, 'power')}</span>
                                    <span>DEF: {getBonus(player.equipment, 'armor')}</span>
                                    <span>AIM: {getBonus(player.equipment, 'aim')}</span>
                                    <span>MAG: {getBonus(player.equipment, 'magicPower')}</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'PRAYER' && (
                            <div className="grid grid-cols-4 gap-1">
                                {PRAYERS.map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() => togglePrayer(p.id)}
                                        className={`w-8 h-8 flex items-center justify-center border cursor-pointer relative ${player.skills.PRAYER.level < p.level ? 'opacity-30 grayscale border-[#4e4336] bg-[#332b22]' : player.activePrayers.includes(p.id) ? 'bg-cyan-900/80 border-cyan-400 shadow-[0_0_10px_cyan]' : 'border-[#4e4336] bg-[#332b22] hover:bg-[#4e4336]'}`}
                                        title={`${p.name} (Lvl ${p.level})`}
                                    >
                                        <span className="text-xl">{p.icon}</span>
                                    </div>
                                ))}
                                <div className="col-span-4 mt-2 text-center text-xs text-zinc-400 border-t border-[#4e4336] pt-1">
                                    Current Points: {Math.floor(player.skills.PRAYER.level)}
                                </div>
                            </div>
                        )}

                        {activeTab === 'STATS' && (
                            <div className="grid grid-cols-2 gap-1 text-[11px]">
                                {SKILL_REGISTRY.map(name => {
                                    const skill = player.skills[name];
                                    if (!skill) return null;
                                    const def = SKILL_DEFINITIONS[name];
                                    const isLocked = !skill.unlocked;
                                    return (
                                        <div key={name} onClick={() => handleStatClick(name)} className={`flex items-center justify-between bg-[#332b22] px-1 py-0.5 border border-[#4e4336] cursor-help hover:bg-[#4e4336] ${isLocked ? 'opacity-50 grayscale' : ''}`}>
                                            <span className="text-[#ff981f] truncate w-16 flex items-center gap-1">{name === 'EVOLUTION' ? '🧬' : ''} {def.name}</span>
                                            <span className="text-yellow-200">{skill.level}</span>
                                        </div>
                                    );
                                })}
                                <div className="col-span-2 text-center text-xs text-zinc-500 mt-2">Total Level: {Object.values(player.skills).reduce((a: number, b: Skill) => a + (b?.level || 0), 0)}</div>
                            </div>
                        )}

                        {activeTab === 'COMBAT' && (
                            <div className="flex flex-col gap-2 p-1">
                                <div className="text-center text-red-400 font-bold mb-2">COMBAT LEVEL: {player.combatLevel}</div>
                                <div className="bg-[#2b2319] p-2 border border-[#4e4336] space-y-2">
                                    {['ACCURATE', 'AGGRESSIVE', 'DEFENSIVE', 'CONTROLLED'].map(style => (
                                        <button
                                            key={style}
                                            onClick={() => props.onSetCombatStyle(style as CombatStyle)}
                                            className={`w-full py-1 text-xs border ${player.combatStyle === style ? 'bg-red-900/50 border-red-500 text-white' : 'bg-[#332b22] border-[#4e4336] text-zinc-400'}`}
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>
                                <div className="text-xs text-center text-zinc-500 mt-2">Auto-Retaliate: ON</div>
                            </div>
                        )}

                        {activeTab === 'MAGIC' && (
                            <div className="grid grid-cols-4 gap-1">
                                {SPELLS.map(spell => (
                                    <div
                                        key={spell.id}
                                        onClick={() => props.onCastSpell(spell.id)}
                                        className={`w-8 h-8 flex items-center justify-center border border-[#4e4336] bg-[#332b22] hover:bg-[#4e4336] cursor-pointer relative ${player.skills.MAGIC.level < spell.level ? 'opacity-30 grayscale' : ''}`}
                                        title={`${spell.name} (Lvl ${spell.level})`}
                                    >
                                        <span className="text-xl">{spell.icon}</span>
                                        {player.skills.MAGIC.level < spell.level && <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-xs bg-black/50">X</div>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'QUEST' && (
                            <div className="p-2 text-sm">
                                <div className="font-bold text-yellow-500 mb-2 border-b border-[#5b5247]">Active Goal</div>
                                <div className="text-white mb-2">{player.quest.name}</div>
                                <div className="text-zinc-400 text-xs italic mb-4">{player.quest.description}</div>

                                {player.quest.targetSkill && (
                                    <div className="bg-[#2b2319] p-2 border border-[#4e4336]">
                                        <div className="text-[10px] uppercase text-zinc-500">Requirement</div>
                                        <div className="flex justify-between text-xs">
                                            <span>{player.quest.targetSkill}</span>
                                            <span className={player.skills[player.quest.targetSkill].level >= (player.quest.targetLevel || 0) ? 'text-green-500' : 'text-red-500'}>
                                                {player.skills[player.quest.targetSkill].level} / {player.quest.targetLevel}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'ADMIN' && (
                            <div className="grid grid-cols-2 gap-2 p-1">
                                <button onClick={toggleSim} className={`col-span-2 w-full py-2 ${player.autoPilot ? 'bg-red-600 animate-pulse' : 'bg-zinc-700'} text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/20`}>
                                    {player.autoPilot ? <Pause size={14} /> : <Play size={14} />} {player.autoPilot ? 'STOP SIMULATION' : 'START SIMULATION'}
                                </button>
                                <AdminBtn label="HEAL" onClick={() => props.onAdminAction('HEAL')} color="green" />
                                <AdminBtn label="FORCE EVO" onClick={() => props.onAdminAction('FORCE_EVO')} color="purple" />
                                <AdminBtn label="SPAWN GOLD" onClick={() => props.onAdminAction('SPAWN_GOLD')} color="yellow" />
                                <div className="col-span-2 grid grid-cols-2 gap-2">
                                    <AdminBtn label="MAX ACCOUNT (GOD MODE)" onClick={() => props.onAdminAction('MAX_OUT')} color="red" />
                                    <AdminBtn label="RESET PLAYER" onClick={() => { if (confirm('Are you sure? This will wipe your progress.')) props.onAdminAction('RESET'); }} color="red" />
                                </div>
                            </div>
                        )}

                        {activeTab === 'SETTINGS' && (
                            <div className="p-2 space-y-4">
                                <div className="text-center text-xs text-zinc-500 border-b border-[#5b5247] pb-1">GAME SETTINGS</div>

                                <div className="bg-[#2b2319] p-2 border border-[#4e4336]">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-xs text-zinc-400"><Volume2 size={14} /> Master Volume</div>
                                        <span className="text-xs font-mono text-yellow-500">{Math.round(volume * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={volume}
                                        onChange={handleVolumeChange}
                                        className="w-full accent-[#ff981f] h-2 bg-[#1a1510] rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                <button
                                    onClick={toggleFullscreen}
                                    className="w-full bg-[#332b22] border border-[#4e4336] py-2 text-xs flex items-center justify-center gap-2 hover:bg-[#4e4336] transition-colors"
                                >
                                    {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                                    {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                                </button>

                                <div className="pt-2 border-t border-[#5b5247]">
                                    <button onClick={() => window.location.reload()} className="w-full bg-[#332b22] border border-[#4e4336] py-1 text-xs text-red-400 flex items-center justify-center gap-2 hover:bg-red-900/30 transition-colors"><LogOut size={12} /> Logout</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chat Box */}
            <div className={`absolute bottom-0 left-0 z-20 w-[420px] h-[180px] pointer-events-auto flex flex-col transition-opacity duration-300 ${minimized ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {/* Channel Tabs */}
                <div className="flex bg-[#2b2319] border-b border-[#1a1510]">
                    {(['PUBLIC', 'PRIVATE', 'FRIENDS', 'AI-CMD'] as const).map(channel => (
                        <button
                            key={channel}
                            onClick={() => setActiveChannel(channel)}
                            className={`flex-1 px-2 py-1 text-[10px] font-bold border-r border-[#1a1510] transition-colors ${activeChannel === channel
                                ? 'bg-[#4e4336] text-white'
                                : 'bg-[#352d24] text-zinc-300 hover:bg-[#3e3529]'
                                }`}
                        >
                            {channel === 'AI-CMD' ? 'AI' : channel}
                        </button>
                    ))}
                </div>

                {/* Messages */}
                <div
                    ref={chatRef}
                    className="flex-1 bg-black/80 p-2 overflow-y-auto font-vt323 text-sm leading-tight text-shadow-sm custom-scrollbar"
                >
                    {logs
                        .filter(log => {
                            // Filter messages by active channel
                            if (!log.channel) return activeChannel === 'PUBLIC'; // Legacy messages default to PUBLIC
                            if (activeChannel === 'AI-CMD') return log.channel === 'AI-CMD' || log.type === 'AI';
                            return log.channel === activeChannel;
                        })
                        .map(log => (
                            <div key={log.id} className="mb-0.5 break-words">
                                {log.sender && <span className={`font-bold mr-1 ${log.type === 'NPC' ? 'text-yellow-500' :
                                    log.type === 'AI' || log.channel === 'AI-CMD' ? 'text-cyan-400' :
                                        log.type === 'COMBAT' ? 'text-red-500' :
                                            log.channel === 'PRIVATE' ? 'text-magenta-400' :
                                                log.channel === 'FRIENDS' ? 'text-cyan-300' :
                                                    log.type === 'CHAT_USER' ? 'text-white' :
                                                        'text-zinc-500'
                                    }`}>{log.sender}:</span>}
                                <span className={
                                    log.type === 'ERROR' ? 'text-red-500' :
                                        log.type === 'INFO' ? 'text-yellow-200' :
                                            log.channel === 'PRIVATE' ? 'text-magenta-300' :
                                                log.channel === 'FRIENDS' ? 'text-cyan-200' :
                                                    log.channel === 'AI-CMD' || log.type === 'AI' ? 'text-cyan-300' :
                                                        'text-[#c0c0c0]'
                                }>{log.text}</span>
                            </div>
                        ))
                    }
                </div>

                {/* Input */}
                <div className="h-[30px] bg-[#3e3529] border-t border-[#5b5247] flex items-center px-2 gap-2">
                    <span className={`text-xs font-bold ${activeChannel === 'PRIVATE' ? 'text-magenta-400' :
                        activeChannel === 'FRIENDS' ? 'text-cyan-400' :
                            activeChannel === 'AI-CMD' ? 'text-yellow-400' :
                                'text-[#ff981f]'
                        }`}>
                        {activeChannel === 'PRIVATE' ? '📨 ' : activeChannel === 'FRIENDS' ? '👥 ' : activeChannel === 'AI-CMD' ? '🤖 ' : ''}
                        {player.name}:
                    </span>
                    <form onSubmit={submitChat} className="flex-1">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-white text-sm font-vt323 placeholder-zinc-600"
                            placeholder={
                                activeChannel === 'PRIVATE' ? '/w name message' :
                                    activeChannel === 'FRIENDS' ? 'Message friends...' :
                                        activeChannel === 'AI-CMD' ? '/ai command' :
                                            'Type to chat...'
                            }
                        />
                    </form>
                </div>

                {/* Quick Companion Commands */}
                <div className="h-[25px] bg-[#2b2319] border-t border-[#5b5247] flex items-center px-2 gap-1">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider mr-1">Gronk:</span>
                    <button
                        onClick={() => { const evt = new CustomEvent('chat-submit', { detail: { message: 'idle', channel: 'AI-CMD' } }); window.dispatchEvent(evt); }}
                        className="px-2 py-[2px] bg-red-900/50 hover:bg-red-800 text-white text-[9px] font-bold uppercase tracking-wide border border-red-700/50">
                        ⏸ Idle
                    </button>
                    <button
                        onClick={() => { const evt = new CustomEvent('chat-submit', { detail: { message: 'follow', channel: 'AI-CMD' } }); window.dispatchEvent(evt); }}
                        className="px-2 py-[2px] bg-blue-900/50 hover:bg-blue-800 text-white text-[9px] font-bold uppercase tracking-wide border border-blue-700/50">
                        👣 Follow
                    </button>
                    <button
                        onClick={() => { const evt = new CustomEvent('chat-submit', { detail: { message: 'gather', channel: 'AI-CMD' } }); window.dispatchEvent(evt); }}
                        className="px-2 py-[2px] bg-green-900/50 hover:bg-green-800 text-white text-[9px] font-bold uppercase tracking-wide border border-green-700/50">
                        ⛏ Gather
                    </button>
                    <button
                        onClick={() => { const evt = new CustomEvent('chat-submit', { detail: { message: 'bank', channel: 'AI-CMD' } }); window.dispatchEvent(evt); }}
                        className="px-2 py-[2px] bg-yellow-900/50 hover:bg-yellow-800 text-white text-[9px] font-bold uppercase tracking-wide border border-yellow-700/50">
                        🏦 Bank
                    </button>
                </div>
            </div>



            {/* AI Companion Interface */}
            <div className={`absolute bottom-2 right-[250px] z-20 pointer-events-auto transition-transform duration-300 ${minimized ? 'translate-y-[280px]' : ''}`}>
                <div className="w-[240px] h-[320px] bg-[#3e3529] border-[4px] border-[#2b2319] shadow-2xl flex flex-col relative">
                    {/* Tab Headers */}
                    <div className="flex flex-wrap bg-[#2b2319]">
                        <TabButton icon={User} active={aiActiveTab === 'AI_SKILLS'} onClick={() => setAIActiveTab('AI_SKILLS')} />
                        <TabButton icon={Backpack} active={aiActiveTab === 'AI_INV'} onClick={() => setAIActiveTab('AI_INV')} />
                        <TabButton icon={Shield} active={aiActiveTab === 'AI_EQUIP'} onClick={() => setAIActiveTab('AI_EQUIP')} />
                        <TabButton icon={Star} active={aiActiveTab === 'AI_PRAYER'} onClick={() => setAIActiveTab('AI_PRAYER')} />
                        <TabButton icon={Zap} active={aiActiveTab === 'AI_MAGIC'} onClick={() => setAIActiveTab('AI_MAGIC')} />
                        <TabButton icon={Crosshair} active={aiActiveTab === 'AI_COMBAT'} onClick={() => setAIActiveTab('AI_COMBAT')} />
                        <TabButton icon={User} active={aiActiveTab === 'AI_CHAT'} onClick={() => setAIActiveTab('AI_CHAT')} />
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-2 overflow-y-auto custom-scrollbar bg-[#3e3529] relative">
                        {/* AI Skills Tab */}
                        {aiActiveTab === 'AI_SKILLS' && (
                            <GronkSkillPanel
                                currentLevel={Object.fromEntries(SKILL_REGISTRY.map(s => [s, player.skills[s]?.level || 1])) as Record<SkillName, number>}
                                onCommandSkill={sendAICommand}
                            />
                        )}

                        {/* AI Inventory Tab */}
                        {aiActiveTab === 'AI_INV' && (
                            <div className="grid grid-cols-4 gap-1"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, 'AI')}
                            >
                                {player.follower.inventory.map((item, i) => (
                                    <ItemSlot
                                        key={i}
                                        item={item}
                                        index={i}
                                        onClick={() => props.onItemClick(item, i)}
                                        onContextMenu={(e: React.MouseEvent) => { if (e && typeof e.preventDefault === 'function') { e.preventDefault(); } props.onContextMenu(item, e.clientX, e.clientY); }}
                                        onDragStart={(e: React.DragEvent) => handleDragStart(e, 'AI', item, i)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e: React.DragEvent) => handleDrop(e, 'AI', i)}
                                    />
                                ))}
                                {[...Array(Math.max(0, 28 - player.follower.inventory.length))].map((_, i) => (
                                    <div key={`ai-empty-${i}`} className="w-[48px] h-[48px] bg-[#1a1510] border border-[#2b2319]"
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, 'AI')}
                                    />
                                ))}
                            </div>
                        )}

                        {/* AI Equipment Tab */}
                        {aiActiveTab === 'AI_EQUIP' && (() => {
                            // Safety check: ensure aiEquipmentSwitch exists
                            if (!player.follower.aiEquipmentSwitch) {
                                return (
                                    <div className="flex flex-col items-center gap-2 pt-2">
                                        <div className="text-[#ff981f] font-bold text-sm mb-2">AI Companion Equipment</div>
                                        <div className="text-xs text-zinc-400 mb-1">Loading equipment settings...</div>
                                        <div className="text-xs text-red-400">Please re-login to initialize AI equipment toggles.</div>
                                    </div>
                                );
                            }

                            return (
                                <div className="flex flex-col items-center gap-2 pt-2">
                                    <div className="text-[#ff981f] font-bold text-sm mb-2">AI Companion Equipment</div>
                                    <div className="text-xs text-zinc-400 mb-1">Toggle auto-equip per slot</div>

                                    {/* Main Equipment Grid */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <div></div>
                                        <div className="flex items-center gap-1">
                                            <EquipSlot item={player.follower.equipment.head} placeholder="⛑️" />
                                            <EquipmentToggle
                                                slot="head"
                                                enabled={player.follower.aiEquipmentSwitch.head || false}
                                                onToggle={props.onToggleAIEquipment}
                                            />
                                        </div>
                                        <div></div>

                                        <div className="flex items-center gap-1">
                                            <EquipSlot item={player.follower.equipment.neck} placeholder="📿" />
                                            <EquipmentToggle
                                                slot="neck"
                                                enabled={player.follower.aiEquipmentSwitch.neck || false}
                                                onToggle={props.onToggleAIEquipment}
                                            />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <EquipSlot item={player.follower.equipment.ammo} placeholder="🏹" />
                                            <EquipmentToggle
                                                slot="ammo"
                                                enabled={player.follower.aiEquipmentSwitch.ammo || false}
                                                onToggle={props.onToggleAIEquipment}
                                            />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <EquipSlot item={player.follower.equipment.aura} placeholder="✨" />
                                            <EquipmentToggle
                                                slot="aura"
                                                enabled={player.follower.aiEquipmentSwitch.aura || false}
                                                onToggle={props.onToggleAIEquipment}
                                            />
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <EquipSlot item={player.follower.equipment.mainHand} placeholder="⚔️" />
                                            <EquipmentToggle
                                                slot="mainHand"
                                                enabled={player.follower.aiEquipmentSwitch.mainHand || false}
                                                onToggle={props.onToggleAIEquipment}
                                            />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <EquipSlot item={player.follower.equipment.body} placeholder="🛡️" />
                                            <EquipmentToggle
                                                slot="body"
                                                enabled={player.follower.aiEquipmentSwitch.body || false}
                                                onToggle={props.onToggleAIEquipment}
                                            />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <EquipSlot item={player.follower.equipment.offHand} placeholder="🛡️" />
                                            <EquipmentToggle
                                                slot="offHand"
                                                enabled={player.follower.aiEquipmentSwitch.offHand || false}
                                                onToggle={props.onToggleAIEquipment}
                                            />
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <EquipSlot item={player.follower.equipment.hands} placeholder="🧤" />
                                            <EquipmentToggle
                                                slot="hands"
                                                enabled={player.follower.aiEquipmentSwitch.hands || false}
                                                onToggle={props.onToggleAIEquipment}
                                            />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <EquipSlot item={player.follower.equipment.legs} placeholder="👖" />
                                            <EquipmentToggle
                                                slot="legs"
                                                enabled={player.follower.aiEquipmentSwitch.legs || false}
                                                onToggle={props.onToggleAIEquipment}
                                            />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <EquipSlot item={player.follower.equipment.feet} placeholder="👢" />
                                            <EquipmentToggle
                                                slot="feet"
                                                enabled={player.follower.aiEquipmentSwitch.feet || false}
                                                onToggle={props.onToggleAIEquipment}
                                            />
                                        </div>
                                    </div>

                                    {/* Rings */}
                                    <div className="grid grid-cols-4 gap-1 mt-2">
                                        {([1, 2, 3, 4, 5, 6, 7, 8] as const).map(i => {
                                            const slot = `ring${i}` as keyof AIEquipment;
                                            return (
                                                <div key={`ai-ring-${i}`} className="flex flex-col items-center gap-0.5">
                                                    <EquipSlot item={player.follower.equipment[slot] as any} placeholder={`💍`} />
                                                    <EquipmentToggle
                                                        slot={slot}
                                                        enabled={player.follower.aiEquipmentSwitch[slot] || false}
                                                        onToggle={props.onToggleAIEquipment}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}


                        {/* AI Prayer Tab */}
                        {aiActiveTab === 'AI_PRAYER' && (
                            <div>
                                <div className="text-[#ff981f] font-bold text-sm mb-2 text-center">AI Prayer Book</div>
                                <div className="text-xs text-zinc-400 text-center mb-2">Auto-switching: {player.follower.prayerEnabled ? 'Enabled' : 'Disabled'}</div>
                                <div className="text-xs text-center text-zinc-500">Prayer features coming soon...</div>
                            </div>
                        )}

                        {/* AI Magic Tab */}
                        {aiActiveTab === 'AI_MAGIC' && (
                            <div>
                                <div className="text-[#ff981f] font-bold text-sm mb-2 text-center">AI Spell Book</div>
                                <div className="text-xs text-center text-zinc-500">Spell combo features coming soon...</div>
                            </div>
                        )}

                        {/* AI Combat Settings Tab */}
                        {aiActiveTab === 'AI_COMBAT' && (
                            <div>
                                <div className="text-[#ff981f] font-bold text-sm mb-2 text-center">Combat AI Settings</div>
                                <div className="space-y-2 text-xs">
                                    <div className="bg-[#2b2319] p-2 border border-[#5b5247]">
                                        <div className="text-[#ff981f] font-bold">Mode: {player.follower.action || 'FOLLOW'}</div>
                                        <div className="text-zinc-400">Current behavior</div>
                                    </div>
                                    <div className="bg-[#2b2319] p-2 border border-[#5b5247]">
                                        <div className="text-zinc-400">Auto prayer switching</div>
                                        <div className="text-zinc-400">Auto weapon switching</div>
                                        <div className="text-zinc-400">Spec usage</div>
                                    </div>
                                    <div className="text-center text-zinc-500 mt-4">Advanced AI features coming soon...</div>
                                </div>
                            </div>
                        )}

                        {/* AI Chat Tab */}
                        {aiActiveTab === 'AI_CHAT' && (
                            <div className="flex flex-col h-full">
                                <div className="text-[#ff981f] font-bold text-sm mb-2 text-center">Talk to {player.follower.name}</div>
                                <div className="flex-1 bg-[#2b2319] border border-[#5b5247] p-2 text-xs overflow-y-auto custom-scrollbar">
                                    <div className="text-zinc-400">AI Chatbot integration coming soon...</div>
                                    <div className="mt-2 text-cyan-300">{player.follower.name}: Ready to assist!</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Minimize Button */}
                    <button
                        onClick={() => setMinimized(!minimized)}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-[#2b2319] border border-[#5b5247] flex items-center justify-center hover:bg-[#3e3529] text-[#ff981f]"
                    >
                        {minimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                </div>
            </div>

            {/* Overlays */}
            {props.contextMenu && <ContextMenu menu={props.contextMenu} onClose={props.onCloseModal} />}
            {props.questPopup && <QuestCompleteModal data={props.questPopup} onClose={props.onCloseModal} />}
            {showSkillGuide && <SkillGuideModal skill={showSkillGuide} onClose={() => setShowSkillGuide(null)} />}

            {/* BANK OVERLAY */}
            {props.bankOpen && (
                <BankModal
                    bankStorage={player.bank || []}
                    playerInventory={player.inventory}
                    aiInventory={player.follower.inventory}
                    bankTabs={player.bankTabs || 1}
                    onClose={props.onCloseModal}
                    onDeposit={(from, itemId, amount) => {
                        props.onBankAction('DEPOSIT', itemId, amount);
                    }}
                    onWithdraw={(itemId, amount, placeholderMode) => {
                        // Pass placeholderMode to backend via specialized action
                        if (placeholderMode) {
                            fetch('/api/game', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    path: '/action/bank',
                                    userId: 'player',
                                    action: 'WITHDRAW',
                                    itemId,
                                    amount,
                                    placeholderMode: true
                                })
                            }).then(r => r.json()).then(res => {
                                if (res.state) setGameState((prev: any) => ({ ...prev, player: res.state }));
                            });
                        } else {
                            props.onBankAction('WITHDRAW', itemId, amount);
                        }
                    }}
                    onAddTab={() => {
                        fetch('/api/game', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                path: '/action/bank',
                                userId: 'player',
                                action: 'ADD_TAB'
                            })
                        }).then(r => r.json()).then(res => {
                            if (res.state) setGameState((prev: any) => ({ ...prev, player: res.state }));
                        });
                    }}
                    onMoveItem={(itemId, toTab) => {
                        fetch('/api/game', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                path: '/action/bank',
                                userId: 'player',
                                action: 'MOVE_ITEM',
                                itemId,
                                toTab
                            })
                        }).then(r => r.json()).then(res => {
                            if (res.state) setGameState((prev: any) => ({ ...prev, player: res.state }));
                        });
                    }}
                    onContextMenu={(item, x, y) => {
                        // Context menu for items IN THE BANK (Withdraw options)
                        const opts = [];
                        opts.push({ label: `Withdraw 1`, action: () => props.onBankAction('WITHDRAW', item.id, 1) });
                        opts.push({ label: `Withdraw 5`, action: () => props.onBankAction('WITHDRAW', item.id, 5) });
                        opts.push({ label: `Withdraw 10`, action: () => props.onBankAction('WITHDRAW', item.id, 10) });
                        opts.push({ label: `Withdraw All`, action: () => props.onBankAction('WITHDRAW', item.id, 'ALL'), variant: 'primary' });
                        opts.push({ label: `Withdraw All but One`, action: () => props.onBankAction('WITHDRAW', item.id, Math.max(1, item.count - 1)) });
                        opts.push({
                            label: `Withdraw X`, action: () => {
                                const amt = prompt('Enter amount to withdraw:');
                                if (amt) props.onBankAction('WITHDRAW', item.id, parseInt(amt) || 1);
                            }
                        });
                        opts.push({ label: 'Examine', action: () => props.onLog(item.description || "It's an item.", "GAME", "INFO") });
                        props.onContextMenuShow({ x, y, title: item.name, options: opts as any });
                    }}
                    onInventoryContextMenu={(item, x, y) => {
                        // Context menu for items IN INVENTORY while Bank is Open (Deposit options)
                        const opts = [];
                        opts.push({ label: `Deposit 1`, action: () => props.onBankAction('DEPOSIT', item.id, 1) });
                        opts.push({ label: `Deposit 5`, action: () => props.onBankAction('DEPOSIT', item.id, 5) });
                        opts.push({ label: `Deposit 10`, action: () => props.onBankAction('DEPOSIT', item.id, 10) });
                        opts.push({ label: `Deposit All`, action: () => props.onBankAction('DEPOSIT', item.id, 'ALL'), variant: 'primary' });
                        opts.push({
                            label: `Deposit X`, action: () => {
                                const amt = prompt('Enter amount to deposit:');
                                if (amt) props.onBankAction('DEPOSIT', item.id, parseInt(amt) || 1);
                            }
                        });
                        opts.push({ label: 'Examine', action: () => props.onLog(item.description || "It's an item.", "GAME", "INFO") });
                        props.onContextMenuShow({ x, y, title: item.name, options: opts as any });
                    }}
                />
            )}

            {/* SHOP OVERLAY */}
            {props.shopOpen && (
                <ShopModal
                    stock={props.shopStock}
                    onClose={props.onCloseModal}
                    onBuy={(item) => props.onShopAction('BUY', item.id)}
                />
            )}

        </div>
    );
};

const EquipSlot = ({ item, placeholder }: { item: InventoryItem | null | undefined, placeholder: string }) => (
    <div className="w-[32px] h-[32px] bg-[#1a1510] border border-[#3e3529] flex items-center justify-center relative shadow-inner">
        {item ? <span className="text-xl drop-shadow-md">{item.icon}</span> : <span className="text-zinc-500 text-sm">{placeholder}</span>}
    </div>
);

const AdminBtn = ({ label, onClick, color }: any) => {
    const bg = color === 'red' ? 'bg-red-900/50 hover:bg-red-800' : color === 'green' ? 'bg-green-900/50 hover:bg-green-800' : color === 'purple' ? 'bg-purple-900/50 hover:bg-purple-800' : 'bg-yellow-900/50 hover:bg-yellow-800';
    return <button onClick={onClick} className={`w-full py-2 ${bg} text-white font-bold text-[10px] border border-white/10 uppercase tracking-wider`}>{label}</button>;
};
