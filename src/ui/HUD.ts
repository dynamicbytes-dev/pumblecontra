/**
 * HUD - Marcadores Arcade retro dibujados en el Canvas
 * Incluye indicador del Nivel (1 al 20), vidas, puntuación y barra dinámica para Jefes
 */

import { Player } from '../game/entities/Player';
import { StorageManager } from '../core/Storage';
import { BossEntity } from '../game/entities/Enemy';

export class HUD {
  public render(
    ctx: CanvasRenderingContext2D,
    player: Player,
    boss: BossEntity | null,
    currentLevel: number = 1,
    totalLevels: number = 20,
    levelName?: string
  ): void {
    const topScore = StorageManager.getInstance().getTopScore();
    const scoreStr = player.score.toString().padStart(6, '0');
    const topStr = Math.max(topScore, player.score).toString().padStart(6, '0');

    ctx.save();

    // 1. Puntuación y Récord (Estilo Arcade Retro)
    ctx.font = 'bold 9px "Courier New", monospace';
    ctx.textAlign = 'left';

    // Jugador 1
    ctx.fillStyle = '#ff3344';
    ctx.fillText('1P', 8, 13);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(scoreStr, 24, 13);

    // High Score
    ctx.fillStyle = '#ffaa00';
    ctx.fillText('HI', 92, 13);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(topStr, 110, 13);

    // 2. INDICADOR DE NIVEL / STAGE ACTUAL (1 al 20)
    ctx.fillStyle = '#0a1020';
    ctx.fillRect(174, 3, 76, 14);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(174, 3, 76, 14);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      `STG ${currentLevel.toString().padStart(2, '0')}/${totalLevels}`,
      212,
      13
    );

    // 3. Vidas (Gorra roja de fontanero)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 8px "Courier New", monospace';
    ctx.fillText('LIFE:', 260, 13);
    for (let i = 0; i < player.lives; i++) {
      const lx = 292 + i * 14;
      // Icono de gorra de fontanero
      ctx.fillStyle = '#e60012';
      ctx.fillRect(lx, 6, 9, 4);
      ctx.fillRect(lx + 5, 8, 4, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(lx + 2, 6, 3, 2);
    }

    // 4. Indicador de Arma actual
    const weaponInfo = player.weaponManager.getWeaponInfo();
    ctx.fillStyle = '#111122';
    ctx.fillRect(360, 3, 74, 14);
    ctx.strokeStyle = weaponInfo.color;
    ctx.lineWidth = 1;
    ctx.strokeRect(360, 3, 74, 14);

    ctx.fillStyle = weaponInfo.color;
    ctx.font = 'bold 8px monospace';
    ctx.fillText(`[${weaponInfo.code}] ${weaponInfo.name.substring(0, 7)}`, 364, 13);

    // 5. BARRA DE VIDA DINÁMICA DE JEFES DE NIVEL HIPERMUSCULOSOS
    if (boss && boss.alive) {
      const barWidth = 180;
      const barHeight = 8;
      const barX = (ctx.canvas.width - barWidth) / 2;
      const barY = 30;

      // Fondo oscuro de la barra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
      ctx.fillRect(barX - 22, barY - 14, barWidth + 44, barHeight + 20);
      ctx.strokeStyle = boss.themeColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(barX - 22, barY - 14, barWidth + 44, barHeight + 20);

      // Título y Subtítulo del Jefe
      ctx.font = 'bold 9px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = boss.themeColor;
      ctx.fillText(`BOSS: ${boss.name}`, ctx.canvas.width / 2, barY - 4);

      if (boss.subtitle) {
        ctx.font = 'bold 7px "Courier New", monospace';
        ctx.fillStyle = boss.isEnraged ? '#ff0033' : '#ffd700';
        ctx.fillText(boss.subtitle, ctx.canvas.width / 2, barY + 13);
      }

      // Fondo interior de la barra de vida
      ctx.fillStyle = '#220008';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Relleno dinámico de salud
      const healthPct = Math.max(0, Math.min(1, boss.health / boss.maxHealth));
      const grad = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
      if (boss.isEnraged) {
        grad.addColorStop(0, '#ff0000');
        grad.addColorStop(1, '#ff6600');
      } else {
        grad.addColorStop(0, '#ff0055');
        grad.addColorStop(1, '#00f0ff');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(barX, barY, barWidth * healthPct, barHeight);

      // Borde metálico de la barra
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, barHeight);

      // Porcentaje numérico de vida
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.ceil(healthPct * 100)}%`, barX + barWidth + 18, barY + 7);
    }

    ctx.restore();
  }
}
