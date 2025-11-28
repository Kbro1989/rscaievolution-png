
import React, { useState } from 'react';
import { Lock, User, Terminal, Cpu, Settings } from 'lucide-react';
import { soundManager } from '../services/soundManager';

interface LoginScreenProps {
    onLogin: (username: string, password: string) => Promise<boolean>;
    onRegister: (username: string, password: string, apiKey?: string) => Promise<boolean>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [showConfig, setShowConfig] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        // Initialize sound on interaction
        soundManager.init();
        soundManager.play('UI_CLICK');

        try {
            let success = false;
            if (isRegistering) {
                success = await onRegister(username, password, apiKey);
            } else {
                success = await onLogin(username, password);
            }

            if (!success) {
                setError('ACCESS DENIED: Invalid Credentials');
                soundManager.play('COMBAT_HIT'); // Error sound
                setLoading(false);
            }
            // If success, parent component handles transition
        } catch (err) {
            setError('System Error');
            setLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 bg-black z-[100] flex items-center justify-center font-vt323">
            <div className="w-full max-w-md p-8 border-2 border-green-900 bg-zinc-900/90 shadow-[0_0_50px_rgba(0,255,0,0.1)] relative overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-6 border-b-2 border-green-900 pb-4">
                    <Terminal className="text-green-500 w-8 h-8" />
                    <div>
                        <h1 className="text-2xl text-green-500 font-bold tracking-widest">RSC: EVOLUTION</h1>
                        <div className="text-xs text-green-800">SECURE UPLINK // V.1.0.6</div>
                    </div>
                </div>

                <div className="flex justify-center gap-4 mb-6">
                    <button 
                        onClick={() => setIsRegistering(false)}
                        className={`flex-1 py-1 text-sm font-bold uppercase transition-all ${!isRegistering ? 'bg-green-900/40 text-green-400 border border-green-600 shadow-[0_0_10px_green]' : 'text-zinc-500 border border-transparent hover:text-green-600'}`}
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => setIsRegistering(true)}
                        className={`flex-1 py-1 text-sm font-bold uppercase transition-all ${isRegistering ? 'bg-green-900/40 text-green-400 border border-green-600 shadow-[0_0_10px_green]' : 'text-zinc-500 border border-transparent hover:text-green-600'}`}
                    >
                        Create Identity
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-green-700 text-sm mb-1 uppercase">Identity</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 text-green-800 w-4 h-4" />
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black border border-green-900 text-green-500 py-2 pl-10 pr-4 focus:outline-none focus:border-green-500 placeholder-green-900"
                                placeholder="ENTER USERNAME"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-green-700 text-sm mb-1 uppercase">Passcode</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-green-800 w-4 h-4" />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black border border-green-900 text-green-500 py-2 pl-10 pr-4 focus:outline-none focus:border-green-500 placeholder-green-900"
                                placeholder="ENTER PASSWORD"
                            />
                        </div>
                    </div>

                    {/* Advanced / API Key Config */}
                    {isRegistering && (
                        <div className="border-t border-green-900 pt-4 animate-in fade-in slide-in-from-top-1">
                            <button 
                                type="button" 
                                onClick={() => setShowConfig(!showConfig)}
                                className="flex items-center gap-2 text-xs text-green-600 hover:text-green-400 mb-2 transition-colors"
                            >
                                <Settings size={12} /> {showConfig ? 'HIDE SYSTEM CONFIG' : 'CONFIGURE AI UPLINK (OPTIONAL)'}
                            </button>
                            
                            {showConfig && (
                                <div className="animate-in fade-in slide-in-from-top-2 bg-black/40 p-2 border border-green-900/50 rounded">
                                    <label className="block text-green-700 text-xs mb-1 uppercase">Personal AI API Key</label>
                                    <div className="relative">
                                        <Cpu className="absolute left-3 top-2.5 text-green-800 w-4 h-4" />
                                        <input 
                                            type="password" 
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            className="w-full bg-black border border-green-900/50 text-green-500 py-2 pl-10 pr-4 focus:outline-none focus:border-green-500 placeholder-green-900 text-xs font-mono"
                                            placeholder="sk-..."
                                        />
                                    </div>
                                    <div className="text-[9px] text-green-800 mt-1">* Used for enhanced Llama/Gemini generation features. Stored locally.</div>
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 text-sm text-center animate-pulse bg-red-900/20 py-1 border border-red-900">
                            > {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-green-900/30 border border-green-700 text-green-400 py-3 hover:bg-green-800/50 hover:text-green-200 transition-all uppercase tracking-wider font-bold shadow-[0_0_15px_rgba(0,128,0,0.2)] hover:shadow-[0_0_25px_rgba(0,128,0,0.4)]"
                    >
                        {loading ? 'PROCESSING...' : (isRegistering ? 'INITIALIZE NEW USER' : 'ESTABLISH CONNECTION')}
                    </button>
                </form>

                {/* Scanlines BG */}
                <div className="pointer-events-none absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
            </div>
        </div>
    );
};
