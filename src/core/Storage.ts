/**
 * StorageManager - Administrador local de High Scores y Configuraciones
 * Cumple con el requisito de persistencia 100% offline en localStorage.
 */

export interface HighScoreEntry {
  name: string;
  score: number;
  date: string;
  weapon: string;
  level: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  controlOpacity: number; // 0.2 a 1.0
  controlScale: number;   // 0.8 a 1.4
  autoFire: boolean;
}

const STORAGE_KEYS = {
  HIGH_SCORES: 'pumblecontra_high_scores_v1',
  SETTINGS: 'pumblecontra_settings_v1',
  STATS: 'pumblecontra_stats_v1',
  MAX_LEVEL: 'pumblecontra_max_level_v1',
};

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  vibrationEnabled: true,
  controlOpacity: 0.85,
  controlScale: 1.0,
  autoFire: true,
};

const DEFAULT_SCORES: HighScoreEntry[] = [
  { name: 'BILL_PUMBLE', score: 10000, date: '2026-10-20', weapon: 'SAUSAGE_SPREAD', level: 12 },
  { name: 'LANCE_CHIP', score: 7500, date: '2026-10-21', weapon: 'BANANA_BOMB', level: 8 },
  { name: 'RED_FALCON', score: 5000, date: '2026-10-22', weapon: 'LASER_BAGUETTE', level: 5 },
  { name: 'ROOKIE_BOY', score: 2500, date: '2026-10-23', weapon: 'PEA_SHOOTER', level: 3 },
  { name: 'NOOB_SOLDIER', score: 1000, date: '2026-10-23', weapon: 'PEA_SHOOTER', level: 1 },
];

export class StorageManager {
  private static instance: StorageManager;
  private settings: GameSettings;
  private highScores: HighScoreEntry[];

  private constructor() {
    this.settings = this.loadSettings();
    this.highScores = this.loadHighScores();
  }

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // --- SETTINGS ---
  public getSettings(): GameSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<GameSettings>): GameSettings {
    this.settings = { ...this.settings, ...partial };
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Error saving settings to localStorage:', e);
    }
    return this.getSettings();
  }

  private loadSettings(): GameSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (raw) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('Error loading settings:', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  // --- HIGH SCORES & PROGRESO ---
  public getHighScores(): HighScoreEntry[] {
    return [...this.highScores];
  }

  public getTopScore(): number {
    return this.highScores.length > 0 ? this.highScores[0].score : 0;
  }

  public isHighScore(score: number): boolean {
    if (this.highScores.length < 5) return score > 0;
    return score > this.highScores[this.highScores.length - 1].score;
  }

  public getMaxLevel(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.MAX_LEVEL);
      if (val) {
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed) && parsed >= 1) {
          return Math.min(20, parsed);
        }
      }
    } catch (e) {
      console.warn('Error loading max level from localStorage:', e);
    }
    return 1;
  }

  public saveMaxLevel(level: number): boolean {
    const currentMax = this.getMaxLevel();
    const newMax = Math.min(20, Math.max(currentMax, level));
    if (newMax > currentMax) {
      try {
        localStorage.setItem(STORAGE_KEYS.MAX_LEVEL, newMax.toString());
        return true;
      } catch (e) {
        console.warn('Error saving max level to localStorage:', e);
      }
    }
    return false;
  }

  public resetProgress(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MAX_LEVEL, '1');
    } catch (e) {
      console.warn('Error resetting max level:', e);
    }
  }

  public saveScore(entry: Omit<HighScoreEntry, 'date'>): boolean {
    const fullEntry: HighScoreEntry = {
      ...entry,
      name: entry.name.trim().toUpperCase().substring(0, 10) || 'PUMBLER',
      level: Math.max(1, Math.min(20, entry.level || 1)),
      date: new Date().toISOString().split('T')[0],
    };

    // Actualizar también el nivel máximo alcanzado
    this.saveMaxLevel(fullEntry.level);

    this.highScores.push(fullEntry);
    this.highScores.sort((a, b) => b.score - a.score);
    this.highScores = this.highScores.slice(0, 10); // Guardamos top 10

    try {
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(this.highScores));
      return true;
    } catch (e) {
      console.warn('Error saving high score to localStorage:', e);
      return false;
    }
  }

  public resetScores(): void {
    this.highScores = [...DEFAULT_SCORES];
    try {
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(this.highScores));
      this.resetProgress();
    } catch (e) {
      console.warn('Error resetting scores:', e);
    }
  }

  private loadHighScores(): HighScoreEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: Partial<HighScoreEntry>) => ({
            name: item.name || 'PUMBLER',
            score: typeof item.score === 'number' ? item.score : 0,
            date: item.date || '2026-10-23',
            weapon: item.weapon || 'PEA_SHOOTER',
            level: typeof item.level === 'number' ? item.level : 1,
          }));
        }
      }
    } catch (e) {
      console.warn('Error loading high scores:', e);
    }
    return [...DEFAULT_SCORES];
  }
}
