
import React, { useState, useEffect, useRef } from 'react';
import { BootScreen } from './components/BootScreen';
import { LoginScreen } from './components/LoginScreen';
import { WorldScene } from './components/WorldScene';
import { GlobeScene } from './components/GlobeScene';
import { GameUI } from './components/GameUI';
import { CharacterCreator } from './components/CharacterCreator';
import { backend } from './services/gameBackend';
import { soundManager } from './services/soundManager';
import { PlayerState, InventoryItem, LogMessage, Appearance, ContextMenuState, QuestCompletion, CombatStyle, Recipe, XPDrop } from './types';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [booted, setBooted] = useState(false);
  const [characterCreated, setCharacterCreated] = useState(false);
  const [gameState, setGameState] = useState<any>({ 
      player: { 
          id: 'guest', position: {x:0,z:0}, inventory: [], bank: [], equipment: { mainHand: null }, skills: {}, quest: {}, currentScene: 'TUTORIAL_ISLAND',
          follower: { id: 'ai-guest', name: 'Gronk', position: {x:0,z:0}, action: 'IDLE' }
      }, 
      world: { resources: [], npcs: [], groundItems: [] },
      globe: { players: [], markers: [] }
  });
  const [logs, setLogs] = useState<LogMessage[]>([]);
  
  // UI States
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [productionMenu, setProductionMenu] = useState<{skill: string, recipes: Recipe[]} | null>(null);
  
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

  const addLog = (text: string, sender?: string, type: any = 'INFO') => setLogs(prev => [...prev, { id: Math.random().toString(), text, sender, type, timestamp: Date.now() }]);

  // --- HANDLERS ---

  useEffect(() => {
      const handleChatSubmit = (e: any) => {
          backend.post('/action/chat', { text: e.detail }).then(res => {
              if (res.aiThought) addLog(res.aiThought, gameState.player.follower.name, "AI");
              if (res.msg) addLog(res.msg, gameState.player.name, "CHAT_USER");
              if (res.state) setGameState((p:any) => ({...p, player: res.state}));
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
      if (res.state) setGameState((p:any) => ({...p, player: res.state}));
      addLog(res.msg || "Command executed.", "SYSTEM", "INFO");
  };

  const handleContextMenu = (e: any) => {
      if(e.title && (e.title === 'NPC' || gameState.world.npcs.find((n:any) => n.name === e.title))) {
         const npc = gameState.world.npcs.find((n:any) => n.name === e.title);
         const options = [...e.options];
         
         // Only allow pickpocketing on civilians, guards, merchants (not rats/monsters)
         if(npc && (npc.role === 'CIVILIAN' || npc.role === 'GUARD' || npc.role === 'MERCHANT' || npc.role === 'GUIDE')) {
            options.push({ 
                label: 'Pickpocket', 
                action: async () => {
                     const res = await backend.post('/action/thieve', { targetId: npc.id });
                     if (res.state) setGameState((prev:any) => ({...prev, player: res.state}));
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

  const handleInteract = async (id: string, type: string, pos: {x:number, z:number}) => {
      setContextMenu(null);

      if (castingSpell) {
          if (type === 'NPC') {
              const res = await backend.post('/action/cast', { spellId: castingSpell, targetId: id });
              if (res.state) setGameState((prev:any) => ({...prev, player: res.state, world: res.world || prev.world}));
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
               if (res.state) setGameState((prev:any) => ({...prev, player: res.state, world: res.world || prev.world}));
               if (res.questComplete) setQuestPopup(res.questComplete);
               if (res.chatEvents) handleChatEvents(res.chatEvents);
               if (res.xpDrops) setXpDrops(res.xpDrops);
          }
          setActiveItem(null);
          return;
      }

      if (type === 'NPC') {
          const npc = gameState.world.npcs.find((n:any) => n.id === id);
          if (npc?.role === 'MERCHANT') { 
             const res = await backend.post('/action/talk', { npcId: id });
             if(res.msg && res.voiceType) soundManager.speak(res.msg, res.voiceType);
             addLog(res.msg || "Hello.", npc.name, "NPC");
             if (res.chatEvents) handleChatEvents(res.chatEvents);
             setShopStock(res.shopStock); setShopOpen(true);
          } else if (npc?.role === 'BANKER') {
              const res = await backend.post('/action/talk', { npcId: id });
              if(res.msg && res.voiceType) soundManager.speak(res.msg, res.voiceType);
              if (res.chatEvents) handleChatEvents(res.chatEvents);
              setBankOpen(true);
          } else if (npc?.role === 'MOB' || npc?.role === 'ENEMY') {
             const res = await backend.post('/action/attack', { targetId: id });
             if(res.state) setGameState((prev:any) => ({...prev, player: res.state, world: res.world}));
             if (res.msg) {
                addLog(res.msg, "COMBAT", "COMBAT");
                if (res.voiceType) soundManager.speak(res.msg, res.voiceType);
             }
             if (res.questComplete) setQuestPopup(res.questComplete);
             if (res.chatEvents) handleChatEvents(res.chatEvents);
             if (res.xpDrops) setXpDrops(res.xpDrops);
          } else {
             const res = await backend.post('/action/talk', { npcId: id });
             if(res.msg && res.voiceType) soundManager.speak(res.msg, res.voiceType);
             addLog(res.msg || "Hi.", npc?.name, "NPC");
             if (res.chatEvents) handleChatEvents(res.chatEvents);
          }
      } 
      else if (type === 'GROUND_ITEM') {
          const res = await backend.post('/action/pickup', { groundItemId: id });
          if (res.state) setGameState((prev:any) => ({...prev, player: res.state, world: res.world}));
          if (res.questComplete) setQuestPopup(res.questComplete);
          if (res.chatEvents) handleChatEvents(res.chatEvents);
      }
      else if (type === 'PORTAL') {
          const res = await backend.post('/action/gather', { targetId: id, type });
           if (res.status === 'SCENE_CHANGE') {
              setGameState((prev:any) => ({...prev, player: res.state}));
              addLog(res.msg || "Warping...");
          } else if (res.status === 'FAIL') {
              addLog(res.msg || "Locked.");
          }
      }
      else {
          const res = await backend.post('/action/gather', { targetId: id, type });
          if (res.status === 'OPEN_SKILL' && res.availableRecipes) {
               setProductionMenu({ skill: res.skillName || 'Skill', recipes: res.availableRecipes });
               addLog(`Opening ${res.skillName} interface...`);
          } else {
              if (res.state) setGameState((prev:any) => ({...prev, player: res.state}));
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
      if (res.state) setGameState((prev:any) => ({...prev, player: res.state}));
      if (res.status === 'FAIL') addLog(res.msg || "Failed.", "SYSTEM", "ERROR");
      else addLog(res.msg || "Crafted.");
      if (res.questComplete) setQuestPopup(res.questComplete);
      if (res.xpDrops) setXpDrops(res.xpDrops);
  };

  const handleTravel = async (targetId: string) => {
      const res = await backend.post('/action/travel', { targetId });
      if (res.status === 'SCENE_CHANGE') {
          setGameState((prev:any) => ({...prev, player: res.state, world: res.world}));
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
                if(res.state) setGameState((p:any)=>({...p, player:res.state}));
                addLog(res.msg || "Sold.");
            });
          return;
      }
      if (bankOpen && item) {
          backend.post('/action/bank', { action: 'DEPOSIT', itemId: item.id, amount: 1 })
            .then(res => {
                if(res.state) setGameState((p:any)=>({...p, player:res.state}));
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
                      if (res.state) setGameState((prev:any) => ({...prev, player: res.state, world: res.world || prev.world}));
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
          opts.push({ label: 'Equip', action: async () => {
              const res = await backend.post('/action/equip', { itemId: item.id });
              if (res.state) setGameState((prev:any) => ({...prev, player: res.state}));
              if (res.status === 'FAIL') addLog(res.msg || "Cannot equip.", "SYSTEM", "ERROR");
              else addLog(res.msg || "Equipped.");
          }, variant: 'primary' });
      }

      if (item.tags.includes('TAG_CONSUMABLE')) {
          opts.push({ label: 'Eat', action: async () => {
              const res = await backend.post('/action/eat', { itemId: item.id });
              if (res.state) setGameState((prev:any) => ({...prev, player: res.state}));
              addLog(res.msg || "Yum.");
          }});
      }
      if (item.tags.includes('TAG_PRAYER')) {
           opts.push({ label: 'Bury', action: async () => {
              const res = await backend.post('/action/pray', { itemId: item.id });
              if (res.state) setGameState((prev:any) => ({...prev, player: res.state}));
              if (res.xpDrops) setXpDrops(res.xpDrops);
              addLog(res.msg || "The gods are pleased.");
          }});
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
    if(!booted || !loggedIn || !characterCreated) return;
    backend.post('/auth/gps', { lat: 0 }).then(res => setGameState(prev => ({ ...prev, player: res.state, world: res.world })));
    
    // --- TICK SYSTEM (0.6s / 600ms) ---
    const interval = setInterval(async () => {
        const res = await backend.post('/ai/tick', {});
        if (res.world) setGameState((prev:any) => ({ ...prev, world: res.world }));
        if (res.state) setGameState((prev:any) => ({ ...prev, player: res.state }));
        if (res.chatEvents) handleChatEvents(res.chatEvents);
        if (res.xpDrops) setXpDrops(res.xpDrops);
    }, 600); 
    return () => clearInterval(interval);
  }, [booted, loggedIn, characterCreated]);

  const handleLogin = async (u: string, p: string) => {
      const res = await backend.post('/auth/login', { username: u, pass: p });
      if(res.status === 'SUCCESS') { 
          setGameState((p:any)=>({...p, player:res.state})); 
          setLoggedIn(true); 
          setCharacterCreated(!!res.state.appearance?.skinColor); 
          return true; 
      }
      return false;
  };

  const handleRegister = async (u: string, p: string, apiKey?: string) => {
      const res = await backend.post('/auth/register', { username: u, pass: p, apiKey });
      if(res.status === 'SUCCESS') {
           setGameState((p:any)=>({...p, player:res.state})); 
           setLoggedIn(true);
           setCharacterCreated(false);
           return true;
      }
      return false;
  };

  const showEquipWarning = gameState.player.quest?.stage === 3 && gameState.player.equipment?.mainHand?.id !== 'spear_stone';

  const updateCameraRotate = (dir: 'LEFT' | 'RIGHT') => setCameraRotation(p => p + (dir==='LEFT'?-0.5:0.5));
  const updateCameraZoom = (dir: 'IN' | 'OUT') => setCameraZoom(p => Math.max(5, Math.min(30, p + (dir==='IN'?-2:2))));

  return (
    <div className="w-full h-screen bg-black text-white font-vt323 overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
        {!loggedIn ? (
            <LoginScreen onLogin={handleLogin} onRegister={handleRegister} />
        ) : !characterCreated ? (
            <CharacterCreator onComplete={async (app) => { await backend.post('/auth/create_char', {appearance:app}); setCharacterCreated(true); }} />
        ) : !booted ? (
            <BootScreen onComplete={() => setBooted(true)} />
        ) : (
            <GameUI 
                player={gameState.player} ai={gameState.player.follower} world={gameState.world} logs={logs} contextMenu={contextMenu} activeItem={activeItem}
                shopOpen={shopOpen} shopStock={shopStock} bankOpen={bankOpen}
                questPopup={questPopup}
                productionMenu={productionMenu}
                onCraft={handleCraft}
                onCloseProduction={() => setProductionMenu(null)}
                hoverText={hoverText}
                hoverColor={hoverColor}
                onCloseModal={() => { setShopOpen(false); setBankOpen(false); setContextMenu(null); setActiveItem(null); setQuestPopup(null); setCastingSpell(null); setProductionMenu(null); }}
                onShopAction={async (a:string, id:string) => { const res = await backend.post('/action/shop', {action:a, itemId:id}); if(res.state) setGameState((p:any)=>({...p, player:res.state})); addLog(res.msg); }}
                onBankAction={async (a:any, id:string, amt:number) => { const res = await backend.post('/action/bank', {action:a, itemId:id, amount:amt}); if(res.state) setGameState((p:any)=>({...p, player:res.state})); }}
                onItemClick={handleInventoryClick}
                onContextMenu={handleInventoryContext}
                onCastSpell={(id) => { setCastingSpell(id); addLog("Select a target..."); }}
                onRotateCamera={updateCameraRotate}
                onZoomCamera={updateCameraZoom}
                onAdminAction={handleAdminAction}
                onToggleMap={() => setViewingGlobe(prev => !prev)}
                onSetCombatStyle={async (style: CombatStyle) => { const res = await backend.post('/action/set_combat_style', {style}); if(res.state) setGameState((p:any)=>({...p, player:res.state})); }}
                xpDrops={xpDrops}
            >
                {(gameState.player.currentScene === 'MAINLAND_GLOBE' || viewingGlobe) ? 
                    <GlobeScene 
                        globeState={gameState.globe} 
                        currentEra={gameState.player.era} 
                        onTravel={handleTravel}
                        onClose={() => setViewingGlobe(false)}
                        isOverlay={viewingGlobe}
                        currentScene={gameState.player.currentScene}
                    /> 
                : 
                    <WorldScene 
                        playerState={gameState.player} 
                        ai={gameState.player.follower}
                        resources={gameState.world.resources} 
                        npcs={gameState.world.npcs}
                        groundItems={gameState.world.groundItems}
                        timeOfDay={gameState.world.timeOfDay}
                        onInteract={handleInteract}
                        onMovePlayer={(x:number, z:number) => { backend.post('/action/move', {x,z}); setGameState((p:any)=>({...p, player:{...p.player, position:{x,z}}})); }}
                        onContextMenu={handleContextMenu}
                        onExamine={addLog}
                        activeDialogues={activeDialogues}
                        cameraRotation={cameraRotation}
                        cameraZoom={cameraZoom}
                        onHover={handleHover}
                        onRotateCamera={updateCameraRotate}
                        onZoomCamera={updateCameraZoom}
                    />
                }
                
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
            </GameUI>
        )}
    </div>
  );
}
export default App;
