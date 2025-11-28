
import React, { useState, Suspense } from 'react';
import { Appearance } from '../types';
import { Check, User, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { PlayerModel } from './WorldRenderers';
import { OrbitControls } from '@react-three/drei';

const DEFAULTS: Appearance = {
    gender: 'MALE',
    skinColor: '#8d5524',
    hairStyle: 0, hairColor: '#202020',
    torsoStyle: 0, torsoColor: '#5e4b35',
    sleevesStyle: 0, sleevesColor: '#5e4b35',
    cuffsStyle: 0, cuffsColor: '#3a3a3a',
    handsStyle: 0, handsColor: '#8d5524',
    legsStyle: 0, legsColor: '#3a3a3a',
    shoesStyle: 0, shoesColor: '#8d5524'
};

interface CharacterCreatorProps {
    initialAppearance?: Appearance;
    mode?: 'ALL' | 'HAIR' | 'CLOTHES' | 'SKIN';
    onComplete: (appearance: Appearance) => void;
}

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({ initialAppearance, mode = 'ALL', onComplete }) => {
    const [app, setApp] = useState<Appearance>(initialAppearance || DEFAULTS);
    const [tab, setTab] = useState<'BODY' | 'HEAD' | 'TORSO' | 'LEGS' | 'FEET'>('BODY');

    const update = (key: keyof Appearance, value: any) => setApp(p => ({ ...p, [key]: value }));

    const StyleSelector = ({ label, field, colorField, max = 9 }: { label: string, field: keyof Appearance, colorField: keyof Appearance, max?: number }) => (
        <div className="bg-zinc-900/50 p-2 border border-zinc-700 rounded mb-2">
            <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider">{label}</span>
                <span className="text-[10px] text-yellow-500 font-mono">STYLE {String(app[field]).padStart(2, '0')}</span>
            </div>
            <div className="flex gap-2 items-center">
                <button
                    onClick={() => update(field, Math.max(0, (app[field] as number) - 1))}
                    className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 flex items-center justify-center text-white"
                >
                    <ChevronLeft size={12} />
                </button>

                {/* Visual Slider Bar */}
                <div className="flex-1 h-2 bg-black rounded-full overflow-hidden flex gap-[1px]">
                    {[...Array(max + 1)].map((_, i) => (
                        <div key={i} className={`flex-1 ${i === app[field] ? 'bg-yellow-500' : 'bg-zinc-800'}`} />
                    ))}
                </div>

                <button
                    onClick={() => update(field, Math.min(max, (app[field] as number) + 1))}
                    className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 flex items-center justify-center text-white"
                >
                    <ChevronRight size={12} />
                </button>
            </div>
            {/* Color Picker */}
            <div className="flex items-center gap-2 mt-2 bg-zinc-800/50 p-1 rounded">
                <div className="w-6 h-6 rounded border border-zinc-600 overflow-hidden relative shadow-inner">
                    <input
                        type="color"
                        value={app[colorField] as string}
                        onChange={(e) => update(colorField, e.target.value)}
                        className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer p-0"
                    />
                </div>
                <span className="text-[10px] text-zinc-500 font-mono uppercase">{app[colorField]}</span>
            </div>
        </div>
    );

    return (
        <div className="absolute inset-0 z-[100] bg-black/90 flex items-center justify-center font-vt323 pointer-events-auto">
            <div className="flex w-[900px] h-[600px] bg-zinc-900 border-2 border-yellow-700 shadow-[0_0_50px_rgba(0,0,0,0.8)]">

                {/* LEFT: 3D PREVIEW AREA */}
                <div className="w-[400px] bg-black border-r border-yellow-900/30 relative flex items-center justify-center overflow-hidden">

                    {/* 3D Canvas */}
                    <Canvas shadows camera={{ position: [0, 1, 3], fov: 40 }}>
                        <Suspense fallback={null}>
                            <color attach="background" args={['#1a1a1a']} />
                            <ambientLight intensity={0.6} />
                            <spotLight position={[5, 10, 5]} intensity={1.5} castShadow />
                            <pointLight position={[-5, 5, -5]} intensity={0.5} />

                            <group position={[0, -1, 0]}>
                                <PlayerModel appearance={app} isMoving={true} evolutionLevel={1} />
                                {/* Platform */}
                                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                                    <circleGeometry args={[1, 32]} />
                                    <meshStandardMaterial color="#222" />
                                </mesh>
                            </group>

                            <OrbitControls
                                enablePan={false}
                                minDistance={2}
                                maxDistance={5}
                                maxPolarAngle={Math.PI / 1.5}
                                autoRotate
                                autoRotateSpeed={1}
                            />
                        </Suspense>
                    </Canvas>

                    {/* Overlay Info */}
                    <div className="absolute top-4 left-4 pointer-events-none">
                        <div className="text-yellow-500 font-bold text-xl tracking-widest drop-shadow-md">IDENTITY CREATION</div>
                        <div className="text-zinc-500 text-xs">ERA: PRIMITIVE</div>
                    </div>

                    <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none">
                        <div className="text-zinc-600 text-[10px] uppercase tracking-widest">
                            Drag to Rotate
                        </div>
                    </div>
                </div>

                {/* RIGHT: CONTROLS */}
                <div className="flex-1 flex flex-col">
                    <div className="bg-zinc-800 p-2 flex border-b border-black">
                        {['BODY', 'HEAD', 'TORSO', 'LEGS', 'FEET'].map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t as any)}
                                className={`flex-1 py-1 text-sm font-bold tracking-widest transition-colors border-r border-black last:border-0 ${tab === t ? 'bg-yellow-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-zinc-900">
                        {tab === 'BODY' && (
                            <>
                                <div className="mb-6">
                                    <label className="block text-zinc-400 text-xs mb-2 tracking-widest font-bold">GENDER SELECTION</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => update('gender', 'MALE')} className={`flex-1 py-3 border-2 transition-all ${app.gender === 'MALE' ? 'bg-blue-900/50 border-blue-500 text-white shadow-[0_0_10px_blue]' : 'bg-zinc-800 border-zinc-700 text-zinc-500 grayscale'}`}>
                                            MALE
                                        </button>
                                        <button onClick={() => update('gender', 'FEMALE')} className={`flex-1 py-3 border-2 transition-all ${app.gender === 'FEMALE' ? 'bg-pink-900/50 border-pink-500 text-white shadow-[0_0_10px_pink]' : 'bg-zinc-800 border-zinc-700 text-zinc-500 grayscale'}`}>
                                            FEMALE
                                        </button>
                                    </div>
                                    <div className="text-[10px] text-zinc-600 mt-2 italic">
                                        * Affects base geometry (Torso shape, Hips, Bust)
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-zinc-400 text-xs mb-2 tracking-widest font-bold">SKIN TONE</label>
                                    <div className="flex items-center gap-4 bg-zinc-800 p-3 rounded border border-zinc-700">
                                        <input type="color" value={app.skinColor} onChange={e => update('skinColor', e.target.value)} className="w-12 h-12 cursor-pointer bg-transparent" />
                                        <span className="text-white font-mono">{app.skinColor}</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {tab === 'HEAD' && (
                            <>
                                <StyleSelector label={app.gender === 'MALE' ? "Hair / Beard Style" : "Hair Style"} field="hairStyle" colorField="hairColor" />
                                <div className="text-[10px] text-zinc-600 mt-1 italic">
                                    {app.gender === 'MALE' ? "* Styles 5-9 include facial hair" : "* Styles range from short to long"}
                                </div>
                            </>
                        )}

                        {tab === 'TORSO' && (
                            <>
                                <StyleSelector label="Chest Style" field="torsoStyle" colorField="torsoColor" />
                                <StyleSelector label="Sleeves" field="sleevesStyle" colorField="sleevesColor" />
                                <StyleSelector label="Hands / Gloves" field="handsStyle" colorField="handsColor" />
                                <StyleSelector label="Cuffs / Wrist" field="cuffsStyle" colorField="cuffsColor" />
                            </>
                        )}

                        {tab === 'LEGS' && (
                            <StyleSelector label="Legs / Skirt" field="legsStyle" colorField="legsColor" />
                        )}

                        {tab === 'FEET' && (
                            <StyleSelector label="Boots Style" field="shoesStyle" colorField="shoesColor" />
                        )}
                    </div>

                    <div className="p-4 border-t border-black bg-zinc-800 flex gap-2">
                        <button
                            onClick={() => setApp(DEFAULTS)}
                            className="px-4 bg-zinc-700 hover:bg-zinc-600 text-white border border-zinc-500"
                            title="Reset to Defaults"
                        >
                            <RotateCcw size={16} />
                        </button>
                        <button
                            onClick={() => onComplete(app)}
                            className="flex-1 bg-green-700 hover:bg-green-600 text-white font-bold py-3 flex items-center justify-center gap-2 shadow-lg transition-all border border-green-500"
                        >
                            <Check size={20} /> FINALISE CHARACTER
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
