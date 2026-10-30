/**
 * ParticleSystem - Efectos visuales de explosiones, chispas, textos cómic y casquillos de bala dorados
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'pixel' | 'smoke' | 'spark' | 'ring' | 'text' | 'shell' | 'muzzle';
  rotation?: number;
  rotationSpeed?: number;
  text?: string;
}

export class ParticleSystem {
  private particles: Particle[] = [];

  public update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.type === 'smoke') {
        p.vy -= 12 * dt; // Humo asciende
        p.size += 10 * dt;
      } else if (p.type === 'spark') {
        p.vy += 320 * dt; // Gravedad para chispas
      } else if (p.type === 'shell') {
        p.vy += 650 * dt; // Gravedad para casquillos dorados
        p.vx *= 0.98;     // Resistencia al aire
        if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
          p.rotation += p.rotationSpeed * dt;
        }
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    ctx.save();
    for (const p of this.particles) {
      const screenX = Math.floor(p.x - cameraX);
      const screenY = Math.floor(p.y - cameraY);

      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

      if (p.type === 'shell') {
        // Casquillo de bala dorado de 16-bits con rotación en el aire
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(p.rotation || 0);

        // Cuerpo dorado del casquillo
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-2, -1, 4, 2);

        // Brillo metálico y base de fulminante
        ctx.fillStyle = '#fff4a3';
        ctx.fillRect(-1, -1, 2, 1);
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(-2, -1, 1, 2);

        ctx.restore();
      } else if (p.type === 'muzzle') {
        // Fogonazo cónico de metralleta pesada
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(p.rotation || 0);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.7);
        ctx.lineTo(p.size * 1.5, 0);
        ctx.lineTo(0, p.size * 0.7);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      } else if (p.type === 'text' && p.text) {
        ctx.font = 'bold 12px "Courier New", monospace';
        ctx.fillStyle = '#000000';
        ctx.fillText(p.text, screenX + 1, screenY + 1); // Sombra cómic
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, screenX, screenY);
      } else if (p.type === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenX, screenY, p.size * (p.life / p.maxLife * 2 + 0.5), 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(screenX - p.size / 2, screenY - p.size / 2, p.size, p.size);
      }
    }
    ctx.restore();
  }

  /**
   * Expulsa un casquillo dorado volando con rotación desde la recámara de la metralleta
   */
  public createBulletShell(x: number, y: number, facingRight: boolean): void {
    // Los casquillos salen despedidos hacia arriba y hacia atrás del jugador
    const dirSign = facingRight ? -1 : 1;
    const ejectVx = dirSign * (50 + Math.random() * 60) + (Math.random() * 20 - 10);
    const ejectVy = -(120 + Math.random() * 90);

    this.particles.push({
      x,
      y,
      vx: ejectVx,
      vy: ejectVy,
      size: 4,
      color: '#ffd700',
      alpha: 1,
      life: 0,
      maxLife: 0.9 + Math.random() * 0.4,
      type: 'shell',
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() * 20 - 10) * 1.8,
    });
  }

  /**
   * Fogonazo de boca de cañón de la metralleta
   */
  public createMuzzleFlash(x: number, y: number, angle: number): void {
    const colors = ['#fff700', '#ff8800', '#ffffff'];
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size: 6 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      life: 0,
      maxLife: 0.05, // Instantáneo (un par de frames)
      type: 'muzzle',
      rotation: angle,
    });
  }

  // Generadores de efectos cómicos de explosión
  public createExplosion(x: number, y: number, comicText?: string): void {
    const colors = ['#ff4400', '#ffcc00', '#ffffff', '#ff0055'];
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 0.3 + Math.random() * 0.3,
        type: 'spark',
      });
    }

    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() * 16 - 8),
        y: y + (Math.random() * 16 - 8),
        vx: (Math.random() * 2 - 1) * 20,
        vy: -15 - Math.random() * 20,
        size: 5 + Math.random() * 5,
        color: '#666677',
        alpha: 0.8,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.3,
        type: 'smoke',
      });
    }

    const texts = ['POW!', 'BOOM!', 'OUCH!', 'SPLAT!', 'KABOOM!'];
    const chosenText = comicText || texts[Math.floor(Math.random() * texts.length)];
    this.particles.push({
      x,
      y: y - 10,
      vx: (Math.random() * 2 - 1) * 15,
      vy: -35,
      size: 14,
      color: '#fffa00',
      alpha: 1,
      life: 0,
      maxLife: 0.7,
      type: 'text',
      text: chosenText,
    });
  }

  public createFloatingText(x: number, y: number, text: string, color = '#00ffcc'): void {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: -25,
      size: 12,
      color,
      alpha: 1,
      life: 0,
      maxLife: 0.6,
      type: 'text',
      text,
    });
  }

  public clear(): void {
    this.particles = [];
  }
}
