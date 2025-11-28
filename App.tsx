
import React, { useState, useEffect, useRef } from 'react';
import { BootScreen } from './components/BootScreen';
import { LoginScreen } from './components/LoginScreen';
import { WorldScene } from './components/WorldScene';
import { GlobeScene } from './components/GlobeScene';
import { RSCGlobeMap } from './components/RSCGlobeMap';
import { GameUI } from './components/GameUI';
import { CharacterCreator } from './components/CharacterCreator';
import { CraftingModal } from './components/CraftingModal';
import { backend } from './services/gameBackend';
import { soundManager } from './services/soundManager';
import { PlayerState, InventoryItem, LogMessage, Appearance, ContextMenuState, QuestCompletion, CombatStyle, Recipe, XPDrop } from './types';

function App() {
    const [loggedIn, setLoggedIn] = useState(true);
    const [booted, setBooted] = useState(true);
    const [characterCreated, setCharacterCreated] = useState(true);
    const [gameState, setGameState] = useState<any>({
        player: {
            id: 'guest', position: { x: 215, z: 450 }, inventory: [], bank: [], equipment: { mainHand: null }, skills: {}, quest: {}, currentScene: 'MAINLAND_GLOBE',
            appearance: {
                gender: 'MALE', skinColor: '#d7b587', hairStyle: 0, hairColor: '#000000',
                torsoStyle: 0, torsoColor: '#888888', sleevesStyle: 0, sleevesColor: '#888888',
                cuffsStyle: 0, cuffsColor: '#000000', handsStyle: 0, handsColor: '#d7b587',
                legsStyle: 0, legsColor: '#444444', shoesStyle: 0, shoesColor: '#000000'
            },
            follower: { id: 'ai-guest', name: 'Gronk', position: { x: 216, z: 450 }, action: 'IDLE' }
        },
        world: { resources: [], npcs: [], groundItems: [] },
        globe: { players: [], markers: [] }
    });
    const [logs, setLogs] = useState<LogMessage[]>([]);

    // UI States
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
    const [shopOpen, setShopOpen] = useState(false);
    const [bankOpen, setBankOpen] = useState(false);
    const [productionMenu, setProductionMenu] = useState<{ skill: string, recipes: Recipe[] } | null>(null);

    const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);
    const [shopStock, setShopStock] = useState([]);

    const [activeDialogues, setActiveDialogues] = useState<Record<string, string>>({});

    const [hoverText, setHoverText] = useState("");
    const [hoverColor, setHoverColor] = useState("white");

    const [questPopup, setQuestPopup] = useState<QuestCompletion | null>(null);
    const [xpDrops, setXpDrops] = useState<XPDrop[]>([]);

    const [cameraRotation, setCameraRotation] = useState(0);
    const [cameraZoom, setCameraZoom] = useState(15);

    const [castingSpell, setCastingSpell] = useState<string | null>(null);
    const [viewingGlobe, setViewingGlobe] = useState(false);

    const addLog = (text: string, sender?: string, type: any = 'INFO', channel?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS' | 'AI-CMD') => setLogs(prev => [...prev, { id: Math.random().toString(), text, sender, type, channel, timestamp: Date.now() }]);

    // --- HANDLERS ---

    useEffect(() => {
        const handleChatSubmit = (e: any) => {
            const { message, channel } = e.detail;
            const endpoint = channel === 'PRIVATE' ? '/action/whisper' :
                channel === 'FRIENDS' ? '/action/friends_chat' :
                    channel === 'AI-CMD' ? '/action/ai_command' :
                        '/action/chat';

            backend.post(endpoint, { text: message, channel }).then(res => {
                if (res.aiThought) addLog(res.aiThought, gameState.player.follower.name, "AI");
                if (res.msg) addLog(res.msg, gameState.player.name, "CHAT_USER", channel);
                if (res.state) setGameState((p: any) => ({ ...p, player: res.state }));
                if (res.chatEvents) handleChatEvents(res.chatEvents);
            });
        };
        window.addEventListener('chat-submit', handleChatSubmit);
        return () => window.removeEventListener('chat-submit', handleChatSubmit);
    }, [gameState.player.name, gameState.player.follower.name]);

    const handleChatEvents = (events: any[]) => {
        if (!events) return;
        events.forEach(evt => {
            setActiveDialogues(prev => ({ ...prev, [evt.sourceId]: evt.text }));
            setTimeout(() => {
                setActiveDialogues(prev => {
                    const n = { ...prev };
                    if (n[evt.sourceId] === evt.text) delete n[evt.sourceId];
                    return n;
                });
            }, 4000);
        });
    };

    const handleAdminAction = async (action: string) => {
        if (!gameState.player.isAdmin) return;
        const res = await backend.post('/admin/action', { action });
        if (res.state) setGameState((p: any) => ({ ...p, player: res.state }));
        addLog(res.msg || "Command executed.", "SYSTEM", "INFO");
    };

    const handleContextMenu = (e: any) => {
        if (e.title && (e.title === 'NPC' || gameState.world.npcs.find((n: any) => n.name === e.title))) {
            const npc = gameState.world.npcs.find((n: any) => n.name === e.title);
            const options = [...e.options];

            // Only allow pickpocketing on civilians, guards, merchants (not rats/monsters)
            if (npc && (npc.role === 'CIVILIAN' || npc.role === 'GUARD' || npc.role === 'MERCHANT' || npc.role === 'GUIDE')) {
                options.push({
                    label: 'Pickpocket',
                    action: async () => {
                        const res = await backend.post('/action/thieve', { targetId: npc.id });
                        if (res.state) setGameState((prev: any) => ({ ...prev, player: res.state }));
                        if (res.msg) addLog(res.msg, "THIEVING", res.status === 'FAIL' ? "COMBAT" : "INFO");
                        if (res.chatEvents) handleChatEvents(res.chatEvents);
                        if (res.xpDrops) setXpDrops(res.xpDrops);
                    },
                    variant: 'danger'
                });
            }

            setContextMenu({ ...e, options });
        } else {
            setContextMenu(e);
        }
    };

    const handleInteract = async (id: string, type: string, pos: { x: number, z: number }) => {
        setContextMenu(null);

        if (castingSpell) {
            if (type === 'NPC' || type === 'NPC_ATTACK') {
                const res = await backend.post('/action/cast', { spellId: castingSpell, targetId: id });
                if (res.state) setGameState((prev: any) => ({ ...prev, player: res.state, world: res.world || prev.world }));
                addLog(res.msg || "Cast spell.");
                if (res.chatEvents) handleChatEvents(res.chatEvents);
                if (res.xpDrops) setXpDrops(res.xpDrops);
            } else {
                addLog("Invalid target.");
            }
            setCastingSpell(null);
            return;
        }

        if (activeItem) {
            const res = await backend.post('/action/use', { itemId: activeItem.id, targetId: id, targetType: type });

            if (res.status === 'OPEN_SKILL' && res.availableRecipes) {
                setProductionMenu({ skill: res.skillName || 'Crafting', recipes: res.availableRecipes });
                addLog(`Opening ${res.skillName} menu...`);
            } else {
                addLog(res.msg || (res.status === 'SUCCESS' ? "Done." : "Nothing interesting happens."));
                if (res.state) setGameState((prev: any) => ({ ...prev, player: res.state, world: res.world || prev.world }));
                if (res.questComplete) setQuestPopup(res.questComplete);
                if (res.chatEvents) handleChatEvents(res.chatEvents);
                if (res.xpDrops) setXpDrops(res.xpDrops);
            }
            setActiveItem(null);
            return;
        }

        // Handle NPC-specific interaction types from WorldScene
        if (type === 'NPC_TALK') {
            const res = await backend.post('/action/npc_interaction', { npcId: id, action: 'Talk-to' });
            if (res.status === 'TRIGGER_ACTION' && res.action) {
                // Handle triggered actions (e.g. Slayer Task Request)
                const actionRes = await backend.post(`/action/${res.action}`, { npcId: id });
                if (actionRes.state) setGameState((prev: any) => ({ ...prev, player: actionRes.state }));
                addLog(actionRes.msg || "Action complete.", "GAME", "INFO");
                return;
            }
            if (res.msg && res.voiceType) soundManager.speak(res.msg, res.voiceType);
            addLog(res.dialogue || res.msg || "Hello.", res.npc?.name || "NPC", "NPC");
            if (res.chatEvents) handleChatEvents(res.chatEvents);
            return;
        }

        if (type === 'NPC_ATTACK') {
            const res = await backend.post('/action/attack', { targetId: id });
            if (res.state) setGameState((prev: any) => ({ ...prev, player: res.state, world: res.world || prev.world }));
            addLog(res.msg || "You attack!", "COMBAT", "COMBAT");
            if (res.voiceType) soundManager.speak(res.msg, res.voiceType);
            if (res.questComplete) setQuestPopup(res.questComplete);
            if (res.chatEvents) handleChatEvents(res.chatEvents);
            if (res.xpDrops) setXpDrops(res.xpDrops);
            return;
        }

        if (type === 'NPC_TRADE') {
            const res = await backend.post('/action/trade', { npcId: id });
            if (res.status === 'OPEN_SHOP' && res.shopStock) {
                setShopStock(res.shopStock);
                setShopOpen(true);
                addLog("Shop opened.");
            }
            return;
        }

        if (type === 'NPC_BANK') {
            setBankOpen(true);
            addLog("Bank opened.");
            return;
        }

        if (type === 'NPC_PICKPOCKET') {
            const res = await backend.post('/action/thieve', { targetId: id });
            if (res.state) setGameState((prev: any) => ({ ...prev, player: res.state }));
            addLog(res.msg || "You attempt to pickpocket...", "THIEVING", res.status === 'FAIL' ? "ERROR" : "INFO");
            if (res.chatEvents) handleChatEvents(res.chatEvents);
            if (res.xpDrops) setXpDrops(res.xpDrops);
            return;
        }

        // Handle default resource/ground item/portal interactions
        if (type === 'GROUND_ITEM') {
            const res = await backend.post('/action/pickup', { groundItemId: id });
            if (res.state) setGameState((prev: any) => ({ ...prev, player: res.state, world: res.world }));
            if (res.questComplete) setQuestPopup(res.questComplete);
            if (res.chatEvents) handleChatEvents(res.chatEvents);
        }
        else if (type === 'PORTAL') {
            const res = await backend.post('/action/gather', { targetId: id, type });
            if (res.status === 'SCENE_CHANGE') {
                setGameState((prev: any) => ({ ...prev, player: res.state, world: res.world }));
                addLog(res.msg || "Warping...");
            } else if (res.status === 'FAIL') {
                addLog(res.msg || "Locked.");
            }
        }
        else {
            const res = await backend.post('/action/gather', { targetId: id, type });
            if (res.status === 'OPEN_BANK') {
                setBankOpen(true);
                soundManager.play('BANK');
                addLog(res.msg || 'Bank opened.');
            } else if (res.status === 'OPEN_CRAFTING' && res.availableRecipes) {
                setProductionMenu({ skill: res.skillName || 'Crafting', recipes: res.availableRecipes });
                addLog(res.msg || `Opening ${res.skillName} interface...`);
            } else if (res.status === 'OPEN_SKILL' && res.availableRecipes) {
                setProductionMenu({ skill: res.skillName || 'Skill', recipes: res.availableRecipes });
                addLog(`Opening ${res.skillName} interface...`);
            } else {
                if (res.state) setGameState((prev: any) => ({ ...prev, player: res.state }));
                if (res.status === 'FAIL') addLog(res.msg || "Failed.", "SYSTEM", "ERROR");
                else addLog(res.msg || "Action complete.");
                if (res.questComplete) setQuestPopup(res.questComplete);
                if (res.chatEvents) handleChatEvents(res.chatEvents);
                if (res.xpDrops) setXpDrops(res.xpDrops);
            }
        }
    };

    const handleCraft = async (recipeId: string) => {
        const res = await backend.post('/action/craft', { recipeId });
        if (res.state) setGameState((prev: any) => ({ ...prev, player: res.state }));
        if (res.status === 'FAIL') addLog(res.msg || "Failed.", "SYSTEM", "ERROR");
        else addLog(res.msg || "Crafted.");
        if (res.questComplete) setQuestPopup(res.questComplete);
        if (res.xpDrops) setXpDrops(res.xpDrops);
    };

    const handleTravel = async (targetId: string) => {
        const res = await backend.post('/action/travel', { targetId });
        if (res.status === 'SCENE_CHANGE') {
            setGameState((prev: any) => ({ ...prev, player: res.state, world: res.world }));
            addLog(res.msg || "Traveling...");
            setViewingGlobe(false);
        } else {
            addLog(res.msg || "Travel failed.", "SYSTEM", "ERROR");
        }
    };

    const handleInventoryClick = (item: InventoryItem | null, index?: number) => {
        if (shopOpen && item) {
            backend.post('/action/shop', { action: 'SELL', itemId: item.id })
                .then(res => {
                    if (res.state) setGameState((p: any) => ({ ...p, player: res.state }));
                    addLog(res.msg || "Sold.");
                });
            return;
        }
        if (bankOpen && item) {
            backend.post('/action/bank', { action: 'DEPOSIT', itemId: item.id, amount: 1 })
                .then(res => {
                    if (res.state) setGameState((p: any) => ({ ...p, player: res.state }));
                    addLog(res.msg || "Deposited.");
                });
            return;
        }

        if (activeItem && item) {
            backend.post('/action/use', { itemId: activeItem.id, targetId: item.id, targetType: 'INVENTORY_ITEM' })
                .then(res => {
                    if (res.status === 'OPEN_SKILL' && res.availableRecipes) {
                        setProductionMenu({ skill: res.skillName || 'Crafting', recipes: res.availableRecipes });
                        addLog("Select an option...");
                    } else {
                        addLog(res.msg || "Nothing happens.");
                        if (res.state) setGameState((prev: any) => ({ ...prev, player: res.state, world: res.world || prev.world }));
                        if (res.questComplete) setQuestPopup(res.questComplete);
                        if (res.chatEvents) handleChatEvents(res.chatEvents);
                        if (res.xpDrops) setXpDrops(res.xpDrops);
                    }
                    setActiveItem(null);
                });
        } else {
            setActiveItem(activeItem ? null : item);
        }
    };

    const handleInventoryContext = (item: InventoryItem, x: number, y: number) => {
        const opts = [];
        opts.push({ label: `Use ${item.name}`, action: () => setActiveItem(item), variant: 'primary' });
        opts.push({ label: 'Examine', action: () => addLog(item.description || "It's an item.", "GAME", "INFO") });

        if (item.tags.includes('TAG_WEAPON_MELEE') || item.tags.includes('TAG_TOOL_AXE') || item.tags.includes('TAG_TOOL_PICK') || item.tags.includes('TAG_WEAPON_MAGIC') || item.tags.includes('TAG_WEAPON_RANGED') || item.tags.includes('TAG_ARMOR') || item.tags.includes('TAG_SHIELD')) {
            opts.push({
                label: 'Equip', action: async () => {
                    const res = await backend.post('/action/equip', { itemId: item.id });
                    if (res.state) setGameState((prev: any) => ({ ...prev, player: res.state }));
                    if (res.status === 'FAIL') addLog(res.msg || "Cannot equip.", "SYSTEM", "ERROR");
                    else addLog(res.msg || "Equipped.");
                }, variant: 'primary'
            });
        }

        if (item.tags.includes('TAG_CONSUMABLE')) {
            opts.push({
                label: 'Eat', action: async () => {
                    const res = await backend.post('/action/eat', { itemId: item.id });
                    if (res.state) setGameState((prev: any) => ({ ...prev, player: res.state }));
                    addLog(res.msg || "Yum.");
                }
            });
        }
        if (item.tags.includes('TAG_PRAYER')) {
            opts.push({
                label: 'Bury', action: async () => {
                    const res = await backend.post('/action/pray', { itemId: item.id });
                    if (res.state) setGameState((prev: any) => ({ ...prev, player: res.state }));
                    if (res.xpDrops) setXpDrops(res.xpDrops);
                    addLog(res.msg || "The gods are pleased.");
                }
            });
        }
        opts.push({ label: 'Drop', action: () => addLog("Dropping not implemented in prototype.") });

        setContextMenu({ x, y, title: item.name, options: opts as any });
    };

    const handleHover = (isHovering: boolean, text: string = "", color: string = "white") => {
        if (isHovering) {
            setHoverText(text);
            setHoverColor(color);
        } else {
            setHoverText("");
        }
    };

    useEffect(() => {
        if (!booted || !loggedIn || !characterCreated) return;
        backend.post('/auth/gps', { lat: 0 }).then(res => setGameState(prev => ({ ...prev, player: res.state, world: res.world, globe: res.globe || prev.globe })));

        // --- TICK SYSTEM (0.6s / 600ms) ---
        const interval = setInterval(async () => {
            const res = await backend.post('/ai/tick', {});
            if (res.world) setGameState((prev: any) => ({ ...prev, world: res.world }));
            if (res.state) setGameState((prev: any) => ({ ...prev, player: res.state }));
            if (res.chatEvents) handleChatEvents(res.chatEvents);
            if (res.xpDrops) setXpDrops(res.xpDrops);
        }, 600);
        return () => clearInterval(interval);
    }, [booted, loggedIn, characterCreated]);

    const handleLogin = async (u: string, p: string) => {
        const res = await backend.post('/auth/login', { username: u, pass: p });
        if (res.status === 'SUCCESS') {
            setGameState((p: any) => ({ ...p, player: res.state, world: res.world, globe: res.globe || p.globe }));
            setLoggedIn(true);
            setCharacterCreated(!!res.state.appearance?.skinColor);
            return true;
        }
        return false;
    };

    const handleRegister = async (u: string, p: string, apiKey?: string) => {
        const res = await backend.post('/auth/register', { username: u, pass: p, apiKey });
        if (res.status === 'SUCCESS') {
            setGameState((p: any) => ({ ...p, player: res.state }));
            setLoggedIn(true);
            setCharacterCreated(false);
            return true;
        }
        return false;
    };

    const showEquipWarning = gameState.player.quest?.stage === 3 && gameState.player.equipment?.mainHand?.id !== 'spear_stone';

    const updateCameraRotate = (dir: 'LEFT' | 'RIGHT') => setCameraRotation(p => p + (dir === 'LEFT' ? -0.5 : 0.5));
    const updateCameraZoom = (dir: 'IN' | 'OUT') => setCameraZoom(p => Math.max(5, Math.min(30, p + (dir === 'IN' ? -2 : 2))));

    return (
        <div className="w-full h-screen bg-black text-white font-vt323 overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
            {!loggedIn ? (
                <LoginScreen onLogin={handleLogin} onRegister={handleRegister} />
            ) : !characterCreated ? (
                <CharacterCreator onComplete={async (app) => { await backend.post('/auth/create_char', { appearance: app }); setCharacterCreated(true); }} />
            ) : !booted ? (
                <BootScreen onComplete={() => setBooted(true)} />
            ) : (
                <>
                    {/* SCENE LAYER */}
                    {/* SCENE LAYER */}
                    {gameState.player.currentScene === 'MAINLAND_GLOBE' ? (
                        <GlobeScene
                            globeState={gameState.globe}
                            currentEra={gameState.player.era}
                            currentEvo={gameState.player.evolutionStage}
                            onTravel={handleTravel}
                            onQuestTrigger={(id) => addLog(`Quest triggered at marker: ${id}`, "SYSTEM", "INFO")}
                            onClose={() => setViewingGlobe(false)}
                            isOverlay={viewingGlobe}
                            currentScene={gameState.player.currentScene}
                        />
                    ) : (
                        <WorldScene
                            playerState={gameState.player}
                            ai={gameState.player.follower}
                            resources={gameState.world.resources}
                            npcs={gameState.world.npcs}
                            groundItems={gameState.world.groundItems}
                            timeOfDay={gameState.world.timeOfDay}
                            onInteract={handleInteract}
                            onMovePlayer={(x: number, z: number) => { backend.post('/action/move', { x, z }); setGameState((p: any) => ({ ...p, player: { ...p.player, position: { x, z } } })); }}
                            onContextMenu={handleContextMenu}
                            onExamine={addLog}


                            activeDialogues={activeDialogues}
                            cameraRotation={cameraRotation}
                            cameraZoom={cameraZoom}
                            onHover={handleHover}
                            onRotateCamera={updateCameraRotate}
                            onZoomCamera={updateCameraZoom}
                        />
                    )}

                    {/* MAP OVERLAY */}
                    {viewingGlobe && (
                        <RSCGlobeMap
                            playerLat={gameState.player.position.x}
                            playerLon={gameState.player.position.z}
                            onClose={() => setViewingGlobe(false)}
                        />
                    )}

                    {/* UI LAYER */}
                    <GameUI
                        player={gameState.player}
                        ai={gameState.player.follower}
                        world={gameState.world}
                        logs={logs}
                        contextMenu={contextMenu}
                        activeItem={activeItem}
                        shopOpen={shopOpen}
                        shopStock={shopStock}
                        bankOpen={bankOpen}
                        questPopup={questPopup}
                        hoverText={hoverText}
                        hoverColor={hoverColor}
                        productionMenu={productionMenu}
                        onCraft={handleCraft}
                        onCloseProduction={() => setProductionMenu(null)}
                        onCloseModal={() => { setShopOpen(false); setBankOpen(false); setContextMenu(null); setActiveItem(null); setQuestPopup(null); setCastingSpell(null); setProductionMenu(null); }}
                        onShopAction={async (a: string, id: string) => { const res = await backend.post('/action/shop', { action: a, itemId: id }); if (res.state) setGameState((p: any) => ({ ...p, player: res.state })); addLog(res.msg || "Shop action."); }}
                        onBankAction={async (a: any, id: string, amt: number | 'ALL') => { const res = await backend.post('/action/bank', { action: a, itemId: id, amount: amt }); if (res.state) setGameState((p: any) => ({ ...p, player: res.state })); }}
                        onItemClick={handleInventoryClick}
                        onContextMenu={handleInventoryContext}
                        onCastSpell={(id) => { setCastingSpell(id); addLog("Select a target...", "MAGIC", "INFO"); }}
                        onRotateCamera={updateCameraRotate}
                        onZoomCamera={updateCameraZoom}
                        onAdminAction={handleAdminAction}
                        onToggleMap={() => setViewingGlobe(prev => !prev)}
                        onSetCombatStyle={async (style: CombatStyle) => { const res = await backend.post('/action/set_combat_style', { style }); if (res.state) setGameState((p: any) => ({ ...p, player: res.state })); }}
                        onTransferItem={async (from: 'PLAYER' | 'AI', to: 'PLAYER' | 'AI', itemId: string, index: number) => {
                            const res = await backend.post('/action/transfer_item', { from, to, itemId, amount: 1 });
                            if (res.state) setGameState((p: any) => ({ ...p, player: res.state }));
                        }}
                        onToggleAIEquipment={async (slot: string, enabled: boolean) => {
                            const res = await backend.post('/action/ai_toggle_equipment', { slot, enabled });
                            if (res.state) setGameState((p: any) => ({ ...p, player: res.state }));
                        }}
                        xpDrops={xpDrops}
                        setGameState={setGameState}
                        onLog={addLog}
                        onContextMenuShow={setContextMenu}
                    />

                    {/* MODAL LAYER */}
                    {productionMenu && (
                        <CraftingModal
                            skillName={productionMenu.skill}
                            recipes={productionMenu.recipes}
                            onClose={() => setProductionMenu(null)}
                            onCraft={handleCraft}
                            inventory={gameState.player.inventory}
                            level={gameState.player.skills[productionMenu.skill.toUpperCase()]?.level || 1}
                        />
                    )}

                    {/* OVERLAYS */}
                    {castingSpell && (
                        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                            <div className="text-4xl text-cyan-300 font-bold drop-shadow-[0_0_10px_blue] animate-pulse">CASTING SPELL...</div>
                        </div>
                    )}

                    {showEquipWarning && gameState.player.currentScene === 'TUTORIAL_ISLAND' && (
                        <div className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center bg-red-900/20 animate-pulse">
                            <div className="text-4xl text-red-500 font-bold bg-black px-6 py-2 border-2 border-red-500 shadow-[0_0_20px_red]">
                                EQUIP SPEAR! (RIGHT CLICK)
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
export default App;
