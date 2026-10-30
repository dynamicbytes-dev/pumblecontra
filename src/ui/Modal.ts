/**
 * ModalManager - Modales para Récords (High Scores), Ajustes (Settings), Game Over y Victoria
 */

import { StorageManager, HighScoreEntry } from '../core/Storage';
import { SoundSystem } from '../core/Audio';

export class ModalManager {
  private overlay: HTMLElement;

  constructor() {
    let el = document.getElementById('game-modal-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'game-modal-overlay';
      el.className = 'modal-overlay hidden';
      document.body.appendChild(el);
    }
    this.overlay = el;
  }

  public showHighScores(onClose?: () => void): void {
    const storage = StorageManager.getInstance();
    const scores = storage.getHighScores();
    const maxLvl = storage.getMaxLevel();

    this.overlay.innerHTML = `
      <div class="modal-card">
        <h2 class="modal-title neon-orange">🏆 TOP HALL OF FAME</h2>
        <p class="modal-subtitle">RÉCORDS LOCALES OFFLINE | NIVEL MÁX: ${maxLvl} / 20</p>

        <div class="high-scores-list">
          <div class="score-header-row">
            <span>#</span>
            <span>PILOTO</span>
            <span>STAGE</span>
            <span>PUNTOS</span>
            <span>WPN</span>
          </div>
          ${scores
            .map(
              (s: HighScoreEntry, idx: number) => `
            <div class="score-row ${idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : ''}">
              <span class="score-rank">${idx + 1}</span>
              <span class="score-name">${s.name}</span>
              <span class="score-level">STG ${s.level || 1}</span>
              <span class="score-pts">${s.score.toString().padStart(6, '0')}</span>
              <span class="score-weapon">[${s.weapon ? s.weapon[0] : 'P'}]</span>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="modal-actions">
          <button id="btn-close-modal" class="arcade-btn btn-primary">VOLVER</button>
          <button id="btn-reset-scores" class="arcade-btn btn-secondary">REINICIAR TODO</button>
        </div>
      </div>
    `;

    this.overlay.classList.remove('hidden');

    document.getElementById('btn-close-modal')?.addEventListener('click', () => {
      this.close();
      onClose?.();
    });

    document.getElementById('btn-reset-scores')?.addEventListener('click', () => {
      if (confirm('¿Deseas restablecer todos los récords locales y el progreso de niveles?')) {
        storage.resetScores();
        this.showHighScores(onClose);
      }
    });
  }

  public showSettings(onUpdate?: () => void, onClose?: () => void): void {
    const storage = StorageManager.getInstance();
    const settings = storage.getSettings();

    this.overlay.innerHTML = `
      <div class="modal-card">
        <h2 class="modal-title neon-cyan">⚙️ AJUSTES DEL JUEGO</h2>
        <p class="modal-subtitle">CONFIGURACIÓN PERSISTENTE</p>

        <div class="settings-form">
          <label class="setting-item">
            <span>Efectos de Sonido (SFX)</span>
            <input type="checkbox" id="setting-sfx" ${settings.soundEnabled ? 'checked' : ''} />
          </label>

          <label class="setting-item">
            <span>Música Chiptune 8-bit</span>
            <input type="checkbox" id="setting-music" ${settings.musicEnabled ? 'checked' : ''} />
          </label>

          <label class="setting-item">
            <span>Vibración Háptica (Móvil)</span>
            <input type="checkbox" id="setting-vib" ${settings.vibrationEnabled ? 'checked' : ''} />
          </label>

          <label class="setting-item">
            <span>Opacidad de Controles Virtuales</span>
            <input type="range" id="setting-opacity" min="0.3" max="1.0" step="0.05" value="${settings.controlOpacity}" />
          </label>

          <label class="setting-item">
            <span>Tamaño de Controles Virtuales</span>
            <input type="range" id="setting-scale" min="0.8" max="1.3" step="0.05" value="${settings.controlScale}" />
          </label>
        </div>

        <div class="modal-actions">
          <button id="btn-close-settings" class="arcade-btn btn-primary">GUARDAR Y SALIR</button>
        </div>
      </div>
    `;

    this.overlay.classList.remove('hidden');

    const sfxCheckbox = document.getElementById('setting-sfx') as HTMLInputElement;
    const musicCheckbox = document.getElementById('setting-music') as HTMLInputElement;
    const vibCheckbox = document.getElementById('setting-vib') as HTMLInputElement;
    const opacityRange = document.getElementById('setting-opacity') as HTMLInputElement;
    const scaleRange = document.getElementById('setting-scale') as HTMLInputElement;

    const saveChanges = () => {
      storage.updateSettings({
        soundEnabled: sfxCheckbox.checked,
        musicEnabled: musicCheckbox.checked,
        vibrationEnabled: vibCheckbox.checked,
        controlOpacity: parseFloat(opacityRange.value),
        controlScale: parseFloat(scaleRange.value),
      });
      SoundSystem.getInstance().updateVolumeLevels();
      onUpdate?.();
    };

    sfxCheckbox?.addEventListener('change', saveChanges);
    musicCheckbox?.addEventListener('change', saveChanges);
    vibCheckbox?.addEventListener('change', saveChanges);
    opacityRange?.addEventListener('input', saveChanges);
    scaleRange?.addEventListener('input', saveChanges);

    document.getElementById('btn-close-settings')?.addEventListener('click', () => {
      saveChanges();
      this.close();
      onClose?.();
    });
  }

  public showGameOver(
    score: number,
    level: number,
    weapon: string,
    onRestart: () => void,
    onMenu: () => void
  ): void {
    const storage = StorageManager.getInstance();
    const isNewHigh = storage.isHighScore(score);

    this.overlay.innerHTML = `
      <div class="modal-card gameover-card">
        <h2 class="modal-title neon-red">💀 GAME OVER</h2>
        <p class="gameover-sub">¡HAS SIDO PULVERIZADO POR LA MASA ALIENÍGENA!</p>

        <div class="gameover-stats">
          <div class="stat-box">
            <span class="stat-label">NIVEL ALCANZADO</span>
            <span class="stat-val neon-yellow">STAGE ${level.toString().padStart(2, '0')} / 20</span>
          </div>

          <div class="stat-box">
            <span class="stat-label">PUNTUACIÓN FINAL</span>
            <span class="stat-val ${isNewHigh ? 'pulse-high' : ''}">${score.toString().padStart(6, '0')}</span>
          </div>

          ${
            isNewHigh
              ? `
            <div class="new-highscore-badge">
              🔥 ¡NUEVO RÉCORD HISTÓRICO!
            </div>
            <div class="player-name-input-group">
              <label for="player-initials">INGRESA TUS INICIALES (3 LETRAS):</label>
              <input type="text" id="player-initials" maxlength="3" value="WIN" autofocus />
            </div>
          `
              : ''
          }
        </div>

        <div class="modal-actions">
          <button id="btn-gameover-restart" class="arcade-btn btn-primary">REINTENTAR</button>
          <button id="btn-gameover-menu" class="arcade-btn btn-secondary">MENÚ PRINCIPAL</button>
        </div>
      </div>
    `;

    this.overlay.classList.remove('hidden');

    const saveScoreIfNew = () => {
      const input = document.getElementById('player-initials') as HTMLInputElement;
      const name = (input?.value || (isNewHigh ? 'WIN' : 'PUM')).toUpperCase();
      storage.saveScore({ name, score, weapon, level });
    };

    document.getElementById('btn-gameover-restart')?.addEventListener('click', () => {
      saveScoreIfNew();
      this.close();
      onRestart();
    });

    document.getElementById('btn-gameover-menu')?.addEventListener('click', () => {
      saveScoreIfNew();
      this.close();
      onMenu();
    });
  }

  public showVictory(
    score: number,
    weapon: string,
    onRestart: () => void,
    onMenu: () => void
  ): void {
    const storage = StorageManager.getInstance();
    const isNewHigh = storage.isHighScore(score);

    this.overlay.innerHTML = `
      <div class="modal-card victory-card">
        <h2 class="modal-title neon-yellow">🏆 ¡MISIÓN CUMPLIDA! 🏆</h2>
        <p class="victory-sub">¡HAS DERROTADO LOS 20 NIVELES Y SALVADO LA TIERRA!</p>

        <div class="gameover-stats">
          <div class="stat-box">
            <span class="stat-label">RANGO SUPREMO</span>
            <span class="stat-val neon-cyan">★ MAESTRO ARCADE ★</span>
          </div>

          <div class="stat-box">
            <span class="stat-label">PUNTUACIÓN DE GLORIA</span>
            <span class="stat-val pulse-high">${score.toString().padStart(6, '0')}</span>
          </div>

          <div class="new-highscore-badge">
            🌟 INMORTALIZADO EN EL HALL OF FAME 🌟
          </div>
          <div class="player-name-input-group">
            <label for="victory-initials">TUS INICIALES DE LEYENDA (3 LETRAS):</label>
            <input type="text" id="victory-initials" maxlength="3" value="ACE" autofocus />
          </div>
        </div>

        <div class="modal-actions">
          <button id="btn-victory-restart" class="arcade-btn btn-primary">JUGAR DE NUEVO</button>
          <button id="btn-victory-menu" class="arcade-btn btn-secondary">MENÚ PRINCIPAL</button>
        </div>
      </div>
    `;

    this.overlay.classList.remove('hidden');

    const saveVictoryScore = () => {
      const input = document.getElementById('victory-initials') as HTMLInputElement;
      const name = (input?.value || 'ACE').toUpperCase();
      storage.saveScore({ name, score, weapon, level: 20 });
    };

    document.getElementById('btn-victory-restart')?.addEventListener('click', () => {
      saveVictoryScore();
      this.close();
      onRestart();
    });

    document.getElementById('btn-victory-menu')?.addEventListener('click', () => {
      saveVictoryScore();
      this.close();
      onMenu();
    });
  }

  public showPause(onResume: () => void, onMenu: () => void): void {
    this.overlay.innerHTML = `
      <div class="modal-card pause-card">
        <h2 class="modal-title neon-yellow">⏸️ JUEGO EN PAUSA</h2>
        <p class="modal-subtitle">TOMA AIRE, SOLDADO</p>

        <div class="modal-actions column">
          <button id="btn-resume" class="arcade-btn btn-primary">CONTINUAR COMBATE</button>
          <button id="btn-pause-menu" class="arcade-btn btn-secondary">SALIR AL MENÚ</button>
        </div>
      </div>
    `;

    this.overlay.classList.remove('hidden');

    document.getElementById('btn-resume')?.addEventListener('click', () => {
      this.close();
      onResume();
    });

    document.getElementById('btn-pause-menu')?.addEventListener('click', () => {
      this.close();
      onMenu();
    });
  }

  public close(): void {
    this.overlay.classList.add('hidden');
    this.overlay.innerHTML = '';
  }
}
