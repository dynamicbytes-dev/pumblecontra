/**
 * Engine - Game Loop con delta time de alta precisión y ciclo de vida
 */

import { Game } from '../game/Game';
import { InputManager } from './Input';

export class Engine {
  private game: Game;
  private lastTime = 0;
  private isRunning = false;
  private animationFrameId: number | null = null;

  constructor(game: Game) {
    this.game = game;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop = (currentTime: number): void => {
    if (!this.isRunning) return;

    // Calcular delta time en segundos (tope máximo de 0.1s para prevenir saltos tras perder foco)
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    // 1. Actualizar física y lógica
    this.game.update(dt);

    // 2. Renderizar escena
    this.game.render();

    // 3. Limpiar estado de botones "just pressed"
    InputManager.getInstance().update();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };
}
