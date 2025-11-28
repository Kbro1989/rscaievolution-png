
import { VoiceType } from '../types';

export class SoundManager {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private enabled: boolean = false;
    private voices: SpeechSynthesisVoice[] = [];
    private currentVolume: number = 0.2;

    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.currentVolume;
            this.masterGain.connect(this.ctx.destination);
            this.enabled = true;

            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                const loadVoices = () => { this.voices = window.speechSynthesis.getVoices(); };
                window.speechSynthesis.onvoiceschanged = loadVoices;
                loadVoices();
            }
        } catch (e) { console.error("AudioContext not supported"); }
    }

    setVolume(value: number) {
        this.currentVolume = Math.max(0, Math.min(1, value));
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
        }
    }

    speak(text: string, type: VoiceType) {
        if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = Math.min(1, this.currentVolume * 2);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        let preferredVoice: SpeechSynthesisVoice | undefined;
        if (type === 'MALE') {
            preferredVoice = this.voices.find(v => (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Google US English')));
            utterance.pitch = 0.9;
        } else if (type === 'FEMALE') {
            preferredVoice = this.voices.find(v => (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha')));
            utterance.pitch = 1.2;
        } else if (type === 'INHUMAN') {
            utterance.pitch = 0.1; utterance.rate = 0.8;
            preferredVoice = this.voices.find(v => v.name.includes('Male'));
        }

        if (preferredVoice) utterance.voice = preferredVoice;
        window.speechSynthesis.speak(utterance);
    }

    // RSC Sound Map - Authentic 2003scape audio preservation
    private audioCache: Map<string, AudioBuffer> = new Map();
    private rscSounds = {
        CHOP: '/audio/rsc/fish.wav',  // Woodcutting (fish = gathering sound)
        MINE: '/audio/rsc/mine.wav',
        COMBAT_HIT: '/audio/rsc/combat1a.wav',
        LEVEL_UP: '/audio/rsc/advance.wav',
        UI_CLICK: '/audio/rsc/click.wav',
        COOK: '/audio/rsc/cooking.wav',
        BANK: '/audio/rsc/coins.wav',
        SPLASH: '/audio/rsc/fish.wav',
        SMITH: '/audio/rsc/anvil.wav',
        DEATH: '/audio/rsc/death.wav',
        PRAYER: '/audio/rsc/prayeron.wav',
        VICTORY: '/audio/rsc/victory.wav',
        EAT: '/audio/rsc/eat.wav',
        TAKE_OBJECT: '/audio/rsc/takeobject.wav',
        DROP_OBJECT: '/audio/rsc/dropobject.wav',
    } as const;

    async loadRSCSound(url: string): Promise<AudioBuffer | null> {
        if (!this.ctx) return null;
        if (this.audioCache.has(url)) return this.audioCache.get(url)!;

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
            this.audioCache.set(url, audioBuffer);
            return audioBuffer;
        } catch (e) {
            console.warn(`Failed to load RSC sound: ${url}`, e);
            return null;
        }
    }

    play(type: 'CHOP' | 'MINE' | 'COMBAT_HIT' | 'LEVEL_UP' | 'UI_CLICK' | 'COOK' | 'BANK' | 'SPLASH' | 'SMITH' | 'DEATH' | 'PRAYER' | 'VICTORY' | 'EAT' | 'TAKE_OBJECT' | 'DROP_OBJECT') {
        if (!this.ctx || !this.enabled || !this.masterGain) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const soundUrl = this.rscSounds[type];
        if (!soundUrl) {
            console.warn(`No RSC sound mapped for: ${type}`);
            return;
        }

        this.loadRSCSound(soundUrl).then(buffer => {
            if (!buffer || !this.ctx || !this.masterGain) return;

            const source = this.ctx.createBufferSource();
            source.buffer = buffer;

            const gain = this.ctx.createGain();
            gain.gain.value = this.currentVolume;

            source.connect(gain);
            gain.connect(this.masterGain);
            source.start(0);
        });
    }

    private playTone(time: number, freq: number, type: OscillatorType, duration: number) {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + duration);
    }

    private playNoise(time: number, duration: number, filterFreq: number, filterType: BiquadFilterType) {
        if (!this.ctx || !this.masterGain) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.value = filterFreq;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(time);
    }
}

export const soundManager = new SoundManager();
