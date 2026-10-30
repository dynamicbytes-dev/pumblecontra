/**
 * InputManager - Gestor unificado de entradas para teclado físico y controles táctiles virtuales
 * Diseñado específicamente para SPA mobile / Capacitor.
 */

import { StorageManager } from './Storage';

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  fire: boolean;
  jump: boolean;
  pause: boolean;
}

export class InputManager {
  private static instance: InputManager;
  private state: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    fire: false,
    jump: false,
    pause: false,
  };

  private prevJump = false;
  private prevFire = false;
  private prevPause = false;

  private keyboardMap: Record<string, keyof InputState> = {
    KeyA: 'left',
    ArrowLeft: 'left',
    KeyD: 'right',
    ArrowRight: 'right',
    KeyW: 'up',
    ArrowUp: 'up',
    KeyS: 'down',
    ArrowDown: 'down',
    KeyJ: 'fire',
    KeyZ: 'fire',
    Space: 'fire',
    KeyK: 'jump',
    KeyX: 'jump',
    KeyP: 'pause',
    Escape: 'pause',
  };

  private constructor() {
    this.setupKeyboardListeners();
  }

  public static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  private setupKeyboardListeners(): void {
    window.addEventListener('keydown', (e) => {
      // Prevenir scrolling con flechas o barra espaciadora
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      const action = this.keyboardMap[e.code];
      if (action) {
        this.state[action] = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      const action = this.keyboardMap[e.code];
      if (action) {
        this.state[action] = false;
      }
    });

    // Limpiar entradas cuando la ventana pierde el foco
    window.addEventListener('blur', () => {
      this.reset();
    });
  }

  public setVirtualButton(action: keyof InputState, isPressed: boolean): void {
    this.state[action] = isPressed;
    if (isPressed) {
      this.triggerHapticFeedback();
    }
  }

  public setVirtualDirection(dir: { x: number; y: number }): void {
    // Umbral de zona muerta analógica para D-Pad digital
    const deadzone = 0.3;
    this.state.left = dir.x < -deadzone;
    this.state.right = dir.x > deadzone;
    this.state.up = dir.y < -deadzone;
    this.state.down = dir.y > deadzone;
  }

  public triggerHapticFeedback(): void {
    const settings = StorageManager.getInstance().getSettings();
    if (settings.vibrationEnabled && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Ignorar si el navegador restringe la vibración
      }
    }
  }

  public getState(): Readonly<InputState> {
    return this.state;
  }

  // Detectores de flanco ascendente (para pulsaciones de un solo frame)
  public isJumpJustPressed(): boolean {
    const justPressed = this.state.jump && !this.prevJump;
    return justPressed;
  }

  public isFireJustPressed(): boolean {
    const justPressed = this.state.fire && !this.prevFire;
    return justPressed;
  }

  public isPauseJustPressed(): boolean {
    const justPressed = this.state.pause && !this.prevPause;
    return justPressed;
  }

  public update(): void {
    this.prevJump = this.state.jump;
    this.prevFire = this.state.fire;
    this.prevPause = this.state.pause;
  }

  public reset(): void {
    this.state.left = false;
    this.state.right = false;
    this.state.up = false;
    this.state.down = false;
    this.state.fire = false;
    this.state.jump = false;
    this.state.pause = false;
    this.prevJump = false;
    this.prevFire = false;
    this.prevPause = false;
  }
}
