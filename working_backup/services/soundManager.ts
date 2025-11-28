
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

    play(type: 'CHOP' | 'MINE' | 'COMBAT_HIT' | 'LEVEL_UP' | 'UI_CLICK' | 'COOK' | 'BANK' | 'SPLASH' | 'SMITH' | 'DEATH') {
        if (!this.ctx || !this.enabled || !this.masterGain) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const t = this.ctx.currentTime;

        switch (type) {
            case 'CHOP': this.playNoise(t, 0.1, 200, 'lowpass'); break;
            case 'MINE': this.playTone(t, 600, 'square', 0.05); this.playNoise(t, 0.05, 3000, 'highpass'); break;
            case 'COMBAT_HIT': this.playNoise(t, 0.15, 400, 'lowpass'); break;
            case 'SMITH': this.playTone(t, 400, 'triangle', 0.3); this.playTone(t, 405, 'triangle', 0.3); break;
            case 'COOK': this.playNoise(t, 0.8, 1000, 'bandpass'); break;
            case 'SPLASH': this.playNoise(t, 0.3, 800, 'highpass'); break;
            case 'BANK': this.playTone(t, 800, 'sine', 0.15); break;
            case 'LEVEL_UP': [440, 554, 659, 880].forEach((freq, i) => this.playTone(t + (i * 0.1), freq, 'square', 0.15)); break;
            case 'UI_CLICK': this.playTone(t, 1200, 'sine', 0.05); break;
            case 'DEATH': this.playTone(t, 100, 'sawtooth', 0.5); this.playNoise(t, 0.5, 50, 'lowpass'); break;
        }
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
