/**
 * SoundSystem - Motor de audio sintético 8-bit / Chiptune con Web Audio API
 * 100% Offline: No requiere archivos de audio externos.
 */

import { StorageManager } from './Storage';

export class SoundSystem {
  private static instance: SoundSystem;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private isMusicPlaying = false;
  private musicInterval: number | null = null;
  private musicStep = 0;

  private constructor() {
    // El AudioContext se inicializa tras el primer gesto del usuario
  }

  public static getInstance(): SoundSystem {
    if (!SoundSystem.instance) {
      SoundSystem.instance = new SoundSystem();
    }
    return SoundSystem.instance;
  }

  public init(): void {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();

      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.updateVolumeLevels();
    } catch (e) {
      console.warn('Web Audio API not supported on this device:', e);
    }
  }

  public updateVolumeLevels(): void {
    const settings = StorageManager.getInstance().getSettings();
    if (!this.sfxGain || !this.musicGain) return;

    this.sfxGain.gain.value = settings.soundEnabled ? 0.35 : 0;
    this.musicGain.gain.value = settings.musicEnabled ? 0.22 : 0;
  }

  public resumeContext(): void {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // --- EFECTOS DE SONIDO (SFX) ---

  public playShoot(weaponType: 'PEA' | 'SPREAD' | 'LASER' | 'BANANA' | 'MACHINEGUN' = 'MACHINEGUN'): void {
    const settings = StorageManager.getInstance().getSettings();
    if (!settings.soundEnabled || !this.ctx || !this.sfxGain) return;
    this.resumeContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.sfxGain);

    if (weaponType === 'MACHINEGUN') {
      // Metralleta pesada estilo Rambo: percusión y chasquido metálico rotundo
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
      osc.start(t);
      osc.stop(t + 0.08);

      // Ruido sordo percusivo secundario
      if (this.ctx) {
        const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.04, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseBuffer.length; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.2, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
        whiteNoise.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        whiteNoise.start(t);
      }
    } else if (weaponType === 'SPREAD') {
      // Disparo múltiple potente (estilo Sausage Spread)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.12);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      osc.start(t);
      osc.stop(t + 0.12);
    } else if (weaponType === 'LASER') {
      // Rayo láser sónico cómico
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.18);
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
      osc.start(t);
      osc.stop(t + 0.18);
    } else if (weaponType === 'BANANA') {
      // Proyectil burbuja/bomba cómica
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.linearRampToValueAtTime(450, t + 0.08);
      osc.frequency.linearRampToValueAtTime(180, t + 0.15);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      osc.start(t);
      osc.stop(t + 0.15);
    } else {
      // Pea shooter básico clásico
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.08);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
      osc.start(t);
      osc.stop(t + 0.08);
    }
  }

  public playJump(): void {
    const settings = StorageManager.getInstance().getSettings();
    if (!settings.soundEnabled || !this.ctx || !this.sfxGain) return;
    this.resumeContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.15);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playExplosion(): void {
    const settings = StorageManager.getInstance().getSettings();
    if (!settings.soundEnabled || !this.ctx || !this.sfxGain) return;
    this.resumeContext();

    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.25);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start();
  }

  public playPowerup(): void {
    const settings = StorageManager.getInstance().getSettings();
    if (!settings.soundEnabled || !this.ctx || !this.sfxGain) return;
    this.resumeContext();

    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + idx * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.08);
    });
  }

  public playPlayerHit(): void {
    const settings = StorageManager.getInstance().getSettings();
    if (!settings.soundEnabled || !this.ctx || !this.sfxGain) return;
    this.resumeContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(90, t + 0.2);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  public playGameOver(): void {
    const settings = StorageManager.getInstance().getSettings();
    if (!settings.soundEnabled || !this.ctx || !this.sfxGain) return;
    this.resumeContext();

    const notes = [330, 311, 293, 261, 196];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.16);
    });
  }

  public playStageClear(): void {
    const settings = StorageManager.getInstance().getSettings();
    if (!settings.soundEnabled || !this.ctx || !this.sfxGain) return;
    this.resumeContext();

    // Fanfarria arcade clásica triunfal ascendente
    const notes = [
      { f: 261.63, d: 0.09 }, // C4
      { f: 329.63, d: 0.09 }, // E4
      { f: 392.00, d: 0.09 }, // G4
      { f: 523.25, d: 0.11 }, // C5
      { f: 659.25, d: 0.11 }, // E5
      { f: 783.99, d: 0.2 },  // G5
      { f: 1046.50, d: 0.45 }, // C6 prolongado triunfal
    ];

    let offset = 0;
    notes.forEach((n) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(n.f, t);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + n.d);

      offset += n.d * 0.75;
    });
  }

  public playFinalVictory(): void {
    const settings = StorageManager.getInstance().getSettings();
    if (!settings.soundEnabled || !this.ctx || !this.sfxGain) return;
    this.resumeContext();

    // Fanfarria suprema de victoria final (Nivel 20)
    const melody = [
      { f: 392.0, d: 0.14 }, // G4
      { f: 392.0, d: 0.14 }, // G4
      { f: 392.0, d: 0.14 }, // G4
      { f: 523.25, d: 0.35 }, // C5
      { f: 659.25, d: 0.25 }, // E5
      { f: 783.99, d: 0.5 },  // G5
      { f: 659.25, d: 0.18 }, // E5
      { f: 1046.50, d: 0.8 }, // C6 majestuoso
    ];

    let offset = 0;
    melody.forEach((n) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + n.d);

      offset += n.d * 0.82;
    });
  }

  // --- MÚSICA EN BUCLE CHIPTUNE ESTILO CONTRA ---

  public startMusic(): void {
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.resumeContext();

    // Secuencia de bajo y arpegio enérgico estilo arcade (escala de Re menor)
    const bassline = [146.83, 146.83, 174.61, 196.00, 146.83, 146.83, 220.00, 196.00];
    const melody = [293.66, 349.23, 440.00, 523.25, 440.00, 392.00, 349.23, 329.63];

    this.musicInterval = window.setInterval(() => {
      const settings = StorageManager.getInstance().getSettings();
      if (!settings.musicEnabled || !this.ctx || !this.musicGain) return;

      const t = this.ctx.currentTime;
      const bFreq = bassline[this.musicStep % bassline.length];
      const mFreq = melody[this.musicStep % melody.length];

      // Bajo arcade potente
      const bOsc = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      bOsc.type = 'triangle';
      bOsc.frequency.setValueAtTime(bFreq, t);
      bGain.gain.setValueAtTime(0.2, t);
      bGain.gain.exponentialRampToValueAtTime(0.01, t + 0.13);
      bOsc.connect(bGain);
      bGain.connect(this.musicGain);
      bOsc.start(t);
      bOsc.stop(t + 0.13);

      // Pulso melódico cada 2 pasos
      if (this.musicStep % 2 === 0) {
        const mOsc = this.ctx.createOscillator();
        const mGain = this.ctx.createGain();
        mOsc.type = 'square';
        mOsc.frequency.setValueAtTime(mFreq, t);
        mGain.gain.setValueAtTime(0.12, t);
        mGain.gain.exponentialRampToValueAtTime(0.005, t + 0.12);
        mOsc.connect(mGain);
        mGain.connect(this.musicGain);
        mOsc.start(t);
        mOsc.stop(t + 0.12);
      }

      this.musicStep++;
    }, 140);
  }

  public stopMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}
