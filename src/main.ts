/**
 * main.ts - Punto de entrada de la aplicación SPA para Web y Capacitor
 */

import './style.css';
import { Game } from './game/Game';
import { Engine } from './core/Engine';
import { SoundSystem } from './core/Audio';
import { ModalManager } from './ui/Modal';
import { StorageManager } from './core/Storage';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  // Inicializar componentes del juego
  const game = new Game(canvas);
  const engine = new Engine(game);
  const modalManager = new ModalManager();

  // Iniciar bucle de renderizado y animación
  engine.start();

  // Referencias de interfaz de usuario
  const mainMenu = document.getElementById('main-menu');
  const btnStart = document.getElementById('btn-start-game');
  const btnContinue = document.getElementById('btn-continue-game');
  const menuMaxLevel = document.getElementById('menu-max-level');
  const btnHighScores = document.getElementById('btn-high-scores');
  const btnSettings = document.getElementById('btn-settings');
  const btnQuickPause = document.getElementById('btn-quick-pause');

  // Actualizar indicadores del nivel máximo alcanzado en el menú
  const updateMenuProgress = () => {
    const maxLvl = StorageManager.getInstance().getMaxLevel();
    if (menuMaxLevel) {
      menuMaxLevel.textContent = `NIVEL MÁXIMO ALCANZADO: STAGE ${maxLvl} / 20`;
    }
    if (btnContinue) {
      if (maxLvl > 1) {
        btnContinue.classList.remove('hidden');
        btnContinue.textContent = `⏩ CONTINUAR (STAGE ${maxLvl})`;
      } else {
        btnContinue.classList.add('hidden');
      }
    }
  };

  updateMenuProgress();

  // Inicializar audio con el primer toque del usuario
  const unlockAudio = () => {
    SoundSystem.getInstance().init();
    SoundSystem.getInstance().resumeContext();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio);
  window.addEventListener('keydown', unlockAudio);

  // Iniciar partida desde el Nivel 1
  btnStart?.addEventListener('click', () => {
    unlockAudio();
    if (mainMenu) mainMenu.classList.add('hidden');
    game.startNewGame(1);
  });

  // Continuar partida desde el nivel máximo alcanzado
  btnContinue?.addEventListener('click', () => {
    unlockAudio();
    const maxLvl = StorageManager.getInstance().getMaxLevel();
    if (mainMenu) mainMenu.classList.add('hidden');
    game.startNewGame(maxLvl);
  });

  // Salón de la Fama (Récords locales en localStorage)
  btnHighScores?.addEventListener('click', () => {
    modalManager.showHighScores(() => {
      updateMenuProgress();
    });
  });

  // Ajustes de audio y controles
  btnSettings?.addEventListener('click', () => {
    modalManager.showSettings(() => {
      game.virtualControls.applySettings();
    });
  });

  // Botón de pausa rápida en pantalla táctil
  btnQuickPause?.addEventListener('click', () => {
    if (game.state === 'PLAYING') {
      game.pauseGame();
    }
  });

  // Clic en canvas durante pantalla de victoria STAGE CLEARED para avance instantáneo
  canvas.addEventListener('click', () => {
    if (game.state === 'STAGE_CLEAR') {
      game.advanceToNextLevel();
    }
  });

  // Escuchar cuando el juego vuelve al menú para mostrar la pantalla de inicio y refrescar récords
  const checkMenuState = () => {
    if (game.state === 'MENU' && mainMenu && mainMenu.classList.contains('hidden')) {
      updateMenuProgress();
      mainMenu.classList.remove('hidden');
    }
    requestAnimationFrame(checkMenuState);
  };
  requestAnimationFrame(checkMenuState);

  // Prevenir zoom accidental en iOS Safari y WebView móvil
  document.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  console.log('🎮 Pumble Contra inicializado con 20 niveles y guardado local.');
});
