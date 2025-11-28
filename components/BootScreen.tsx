
import React, { useEffect, useState } from 'react';
import { Locate, Globe, Activity } from 'lucide-react';
import { soundManager } from '../services/soundManager';

interface BootScreenProps {
    onComplete: (lat: number) => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
    const [logs, setLogs] = useState<string[]>([]);
    const [stage, setStage] = useState<'BOOT' | 'SCAN' | 'READY'>('BOOT');

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    useEffect(() => {
        let timeout: any;

        const runBoot = async () => {
            addLog("INITIALIZING SYSTEM KERNEL...");
            await new Promise(r => setTimeout(r, 800));
            addLog("LOADING TERRAIN GENERATOR...");
            await new Promise(r => setTimeout(r, 800));
            addLog("CONNECTING TO CLOUDFLARE WORKERS...");
            await new Promise(r => setTimeout(r, 800));
            addLog("ESTABLISHING SECURE UPLINK...");
            await new Promise(r => setTimeout(r, 800));
            setStage('SCAN');
        };

        runBoot();
        return () => clearTimeout(timeout);
    }, []);

    const handleScan = () => {
        // Initialize Audio Context (requires user interaction)
        soundManager.init();
        soundManager.play('UI_CLICK');

        addLog("REQUESTING BIOMETRIC DATA...");

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    addLog(`GPS LOCKED: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
                    addLog("CALCULATING BIOME...");
                    setTimeout(() => {
                        setStage('READY');
                        onComplete(position.coords.latitude);
                    }, 1000);
                },
                (err) => {
                    addLog(`GPS ERROR: ${err.message}`);
                    addLog("DEFAULTING TO NULL ISLAND (0,0)");
                    setTimeout(() => {
                        setStage('READY');
                        onComplete(0);
                    }, 1000);
                }
            );
        } else {
            addLog("GPS MODULE MISSING.");
            setTimeout(() => {
                setStage('READY');
                onComplete(0);
            }, 1000);
        }
    };

    return (
        <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center text-green-500 p-8">
            <div className="w-full max-w-md border border-green-800 bg-zinc-900/80 p-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <div className="flex items-center justify-between border-b border-green-800 pb-2 mb-4">
                    <h1 className="text-xl font-bold tracking-widest">PROJECT: GENESIS</h1>
                    <Activity className="animate-pulse w-5 h-5" />
                </div>

                <div className="h-64 overflow-y-auto font-mono text-sm space-y-1 mb-6 p-2 bg-black/50 border border-green-900/50">
                    {logs.map((log, i) => (
                        <div key={i} className="break-words">&gt; {log}</div>
                    ))}
                    {stage === 'SCAN' && (
                        <div className="animate-pulse">&gt; WAITING FOR INPUT...</div>
                    )}
                </div>

                <div className="flex justify-center">
                    {stage === 'SCAN' && (
                        <button
                            onClick={handleScan}
                            className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-black font-bold py-3 px-6 transition-all hover:shadow-[0_0_15px_rgba(34,197,94,0.6)]"
                        >
                            <Locate size={20} />
                            INITIATE SCAN
                        </button>
                    )}
                    {stage === 'BOOT' && (
                        <div className="flex items-center gap-2 text-green-700">
                            <Globe className="animate-spin-slow" />
                            SYSTEM LOADING...
                        </div>
                    )}
                    {stage === 'READY' && (
                        <div className="text-green-400 font-bold animate-bounce">
                            ENTERING SIMULATION...
                        </div>
                    )}
                </div>
            </div>

            {/* Scanline effect */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_4px,3px_100%]"></div>
        </div>
    );
};
