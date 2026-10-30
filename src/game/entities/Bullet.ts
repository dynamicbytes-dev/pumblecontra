/**
 * Bullet - Proyectiles del jugador, enemigos y jefes paródicos y animatrónicos
 */

export type BulletType =
  | 'PEA'
  | 'SPREAD'
  | 'LASER'
  | 'BANANA'
  | 'MACHINEGUN'
  | 'ENEMY'
  | 'HAM_BOMB'
  | 'BARREL_MISSILE'
  | 'BOOMERANG_HAT'
  | 'SPORE'
  | 'LIZARD_SPIKE'
  | 'FREDDY_MUSIC_NOTE'
  | 'BONNIE_LASER_BEAM'
  | 'CHICA_CUPCAKE_BOMB'
  | 'CHICA_TOXIC_STEAM'
  | 'FOXY_CANNON_BALL';

export interface BulletConfig {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  isEnemy: boolean;
  color: string;
  type: BulletType;
  life?: number;
  originX?: number; // Para proyectiles con retorno (bumerán)
  originY?: number;
}

export class Bullet {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public radius: number;
  public damage: number;
  public isEnemy: boolean;
  public color: string;
  public type: BulletType;
  public alive = true;
  public life = 0;
  public maxLife = 3.0;

  // Variables para bumerán o proyectiles especiales
  private rotation = 0;
  private initialVx: number;

  constructor(cfg: BulletConfig) {
    this.x = cfg.x;
    this.y = cfg.y;
    this.vx = cfg.vx;
    this.vy = cfg.vy;
    this.initialVx = cfg.vx;
    this.radius = cfg.radius;
    this.damage = cfg.damage;
    this.isEnemy = cfg.isEnemy;
    this.color = cfg.color;
    this.type = cfg.type;

    if (cfg.type === 'BOOMERANG_HAT') {
      this.maxLife = 3.2;
    } else if (cfg.type === 'HAM_BOMB' || cfg.type === 'CHICA_CUPCAKE_BOMB') {
      this.maxLife = 2.4;
    } else if (cfg.type === 'FREDDY_MUSIC_NOTE') {
      this.maxLife = 3.5;
    } else if (cfg.type === 'CHICA_TOXIC_STEAM') {
      this.maxLife = 2.0;
    }
  }

  public update(dt: number): void {
    this.life += dt;
    if (this.life > this.maxLife) {
      this.alive = false;
      return;
    }

    this.rotation += dt * 15;

    if (this.type === 'BANANA' || this.type === 'HAM_BOMB' || this.type === 'CHICA_CUPCAKE_BOMB') {
      // Trayectoria en arco gravitacional
      this.vy += 400 * dt;
    } else if (this.type === 'BOOMERANG_HAT') {
      // Bumerán: viaja hacia adelante y luego se desacelera hasta invertir su dirección
      const turnTime = 1.0;
      if (this.life < turnTime) {
        this.vx -= (this.initialVx * 1.8) * dt;
      } else {
        // Regreso acelerado hacia la posición original
        this.vx += (this.initialVx < 0 ? 320 : -320) * dt;
      }
      this.y += Math.sin(this.life * 6) * 1.5;
    } else if (this.type === 'SPORE' || this.type === 'FREDDY_MUSIC_NOTE') {
      // Flotación ondulante en onda senoidal
      this.vy += Math.sin(this.life * 8) * 16 * dt;
    } else if (this.type === 'CHICA_TOXIC_STEAM') {
      this.radius += dt * 4;
      this.vy -= 20 * dt; // Flota ligeramente hacia arriba
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    const sx = Math.floor(this.x - cameraX);
    const sy = Math.floor(this.y - cameraY);

    ctx.save();

    if (this.type === 'BOOMERANG_HAT') {
      // Sombrero de pescador de Don Ramfis giratorio y afilado
      ctx.translate(sx, sy);
      ctx.rotate(this.rotation);

      // Copa del sombrero azul desgastado
      ctx.fillStyle = '#4a75a0';
      ctx.fillRect(-6, -6, 12, 12);
      ctx.fillStyle = '#2c4d6f';
      ctx.fillRect(-4, -4, 8, 8);

      // Ala del sombrero con navajas afiladas de 16-bits
      ctx.fillStyle = '#3a628a';
      ctx.fillRect(-12, -2, 24, 4);

      // Cuchillas metálicas relucientes en los extremos
      ctx.fillStyle = '#e6ffff';
      ctx.fillRect(-14, -1, 3, 2);
      ctx.fillRect(11, -1, 3, 2);
      ctx.fillRect(-1, -14, 2, 3);
      ctx.fillRect(-1, 11, 2, 3);

    } else if (this.type === 'HAM_BOMB') {
      // Torta de jamón explosiva de El Chaval
      ctx.translate(sx, sy);
      ctx.rotate(this.rotation * 0.4);

      // Pan superior e inferior
      ctx.fillStyle = '#d48d3b';
      ctx.fillRect(-7, -5, 14, 4);
      ctx.fillRect(-7, 2, 14, 4);

      // Jamón gigante rosado y lechuga
      ctx.fillStyle = '#ff6b8b';
      ctx.fillRect(-8, -1, 16, 3);
      ctx.fillStyle = '#44cc44';
      ctx.fillRect(-6, 1, 12, 1);

      // Mecha/fusible encendido con chispa
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5, -6, 2, 2);
      ctx.fillStyle = '#ff2200';
      ctx.fillRect(7, -8, 3, 3);

    } else if (this.type === 'BARREL_MISSILE') {
      // Cohete barril de madera blindado
      const angle = Math.atan2(this.vy, this.vx);
      ctx.translate(sx, sy);
      ctx.rotate(angle);

      // Madera del barril
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(-10, -5, 20, 10);
      // Aros metálicos
      ctx.fillStyle = '#444455';
      ctx.fillRect(-6, -6, 3, 12);
      ctx.fillRect(3, -6, 3, 12);

      // Fuego propulsor trasero
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(-14, -3, 5, 6);
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(-12, -2, 3, 4);

    } else if (this.type === 'FREDDY_MUSIC_NOTE') {
      // Nota musical explosiva de Freddy Fazbear
      ctx.translate(sx, sy);
      ctx.rotate(Math.sin(this.life * 10) * 0.4);

      // Resplandor de aura
      ctx.fillStyle = '#ff0033';
      ctx.fillRect(-6, -7, 13, 14);

      // Cabeza de nota musical doble
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-5, 0, 4, 4);
      ctx.fillRect(2, 0, 4, 4);

      // Plicas verticales
      ctx.fillRect(-2, -6, 2, 7);
      ctx.fillRect(5, -6, 2, 7);

      // Barra superior de corchea
      ctx.fillRect(-2, -6, 9, 3);

    } else if (this.type === 'BONNIE_LASER_BEAM') {
      // Rayo eléctrico láser de la guitarra acorazada de Bonnie
      const angle = Math.atan2(this.vy, this.vx);
      ctx.translate(sx, sy);
      ctx.rotate(angle);

      // Rayo principal violeta y magenta
      ctx.fillStyle = '#9333ea';
      ctx.fillRect(-12, -4, 24, 8);
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(-10, -2, 20, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -1, 12, 2);

    } else if (this.type === 'CHICA_CUPCAKE_BOMB') {
      // Mr. Cupcake mutante explosivo
      ctx.translate(sx, sy);
      ctx.rotate(this.rotation * 0.6);

      // Envoltura base metálica
      ctx.fillStyle = '#475569';
      ctx.fillRect(-5, 1, 10, 6);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-3, 2, 2, 4);
      ctx.fillRect(1, 2, 2, 4);

      // Glaseado rosa tóxico
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-7, -4, 14, 6);
      ctx.fillRect(-5, -6, 10, 3);

      // Ojos saltones amarillos desquiciados
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-4, -3, 3, 3);
      ctx.fillRect(1, -3, 3, 3);
      ctx.fillStyle = '#000000';
      ctx.fillRect(-3, -2, 1, 1);
      ctx.fillRect(2, -2, 1, 1);

      // Vela encendida con fuego violeta
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1, -8, 2, 3);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(-1, -11, 2, 3);

    } else if (this.type === 'CHICA_TOXIC_STEAM') {
      // Vapor tóxico corrosivo de Mr. Cupcake
      ctx.fillStyle = 'rgba(74, 222, 128, 0.7)';
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(3, this.radius), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(236, 72, 153, 0.6)';
      ctx.beginPath();
      ctx.arc(sx + 2, sy - 2, Math.max(2, this.radius - 2), 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'FOXY_CANNON_BALL') {
      // Bola de cañón de Foxy ardiente
      ctx.translate(sx, sy);
      ctx.rotate(this.rotation);

      // Hierro forjado oscuro
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // Grietas de calor ardiente y chispa
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-2, -2, 4, 4);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-1, -1, 2, 2);

      // Estela de fuego
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-this.radius - 4, -2, 4, 4);

    } else if (this.type === 'SPORE') {
      // Espora venenosa zombi púrpura/verde
      ctx.fillStyle = '#9b30ff';
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#39ff14';
      ctx.beginPath();
      ctx.arc(sx, sy, 2, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'LIZARD_SPIKE') {
      // Espina ósea defensiva del lagarto
      const angle = Math.atan2(this.vy, this.vx);
      ctx.translate(sx, sy);
      ctx.rotate(angle);

      ctx.fillStyle = '#e0d8b0';
      ctx.beginPath();
      ctx.moveTo(-6, -3);
      ctx.lineTo(8, 0);
      ctx.lineTo(-6, 3);
      ctx.closePath();
      ctx.fill();

    } else if (this.type === 'MACHINEGUN') {
      const angle = Math.atan2(this.vy, this.vx);
      ctx.translate(sx, sy);
      ctx.rotate(angle);

      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(-8, -2, 14, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-5, -1, 10, 2);
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(4, -1, 3, 2);

    } else if (this.type === 'SPREAD') {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(sx, sy, this.radius + 2, this.radius, Math.atan2(this.vy, this.vx), 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffee66';
      ctx.lineWidth = 1;
      ctx.stroke();

    } else if (this.type === 'LASER') {
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(sx - 8, sy - 2, 16, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx - 5, sy - 1, 10, 2);

    } else if (this.type === 'BANANA') {
      ctx.fillStyle = '#ffe600';
      ctx.beginPath();
      ctx.arc(sx, sy, this.radius, 0.4, Math.PI * 1.6);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffe600';
      ctx.stroke();

    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(sx, sy, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx - 1, sy - 1, Math.max(1, this.radius - 2), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
