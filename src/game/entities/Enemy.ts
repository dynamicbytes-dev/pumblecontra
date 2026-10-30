/**
 * Enemy & Bosses - Sistema de Enemigos Comunes y Jefes Hipermusculosos
 * Estética pixel art retro 16-bits con renderizado nítido.
 */

import { Entity, Rect } from './Entity';
import { Bullet } from './Bullet';
import { WeaponType } from '../WeaponSystem';
import { SoundSystem } from '../../core/Audio';

export interface BossEntity extends Entity {
  name: string;
  subtitle: string;
  health: number;
  maxHealth: number;
  isEnraged: boolean;
  themeColor: string;
  update(dt: number, levelPlatforms: Rect[]): void;
  attack(playerX: number, playerY: number): Bullet[];
}

/* ==========================================================================
   ÍTEMS Y CÁPSULAS DE POWER-UP
   ========================================================================== */

export class PowerUpItem extends Entity {
  public weaponType: WeaponType;
  public collected = false;
  private bounceTimer = 0;

  constructor(x: number, y: number, weaponType: WeaponType) {
    super(x, y, 16, 16);
    this.weaponType = weaponType;
    this.vy = -120;
  }

  public update(dt: number, levelPlatforms: Rect[]): void {
    this.bounceTimer += dt;
    this.vy += 450 * dt;
    this.y += this.vy * dt;

    for (const plat of levelPlatforms) {
      if (this.vy > 0 && Entity.checkCollision(this.getBounds(), plat)) {
        this.y = plat.y - this.height;
        this.vy = -60;
        break;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    const sx = Math.floor(this.x - cameraX);
    const sy = Math.floor(this.y - cameraY);

    ctx.save();
    const glow = Math.sin(this.bounceTimer * 8) * 3;
    ctx.fillStyle = '#fffa00';
    ctx.beginPath();
    ctx.arc(sx + 8, sy + 8, 9 + glow, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#cc1133';
    ctx.fillRect(sx + 1, sy + 1, 14, 14);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.weaponType[0], sx + 8, sy + 8);

    ctx.restore();
  }
}

export class FlyingCapsule extends Entity {
  public weaponDrop: WeaponType;
  private time = 0;
  private startY: number;

  constructor(x: number, y: number, weaponDrop: WeaponType = 'SPREAD') {
    super(x, y, 22, 14);
    this.weaponDrop = weaponDrop;
    this.startY = y;
    this.vx = 75;
  }

  public update(dt: number): void {
    this.time += dt;
    this.x += this.vx * dt;
    this.y = this.startY + Math.sin(this.time * 4) * 20;
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    const sx = Math.floor(this.x - cameraX);
    const sy = Math.floor(this.y - cameraY);

    ctx.save();
    ctx.fillStyle = '#ff2255';
    ctx.beginPath();
    ctx.ellipse(sx + 11, sy + 7, 11, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    const wingY = Math.sin(this.time * 15) * 4;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sx - 4, sy + 4 + wingY, 6, 3);
    ctx.fillRect(sx + 20, sy + 4 - wingY, 6, 3);

    ctx.fillStyle = '#ffff00';
    ctx.fillRect(sx + 8, sy + 5, 6, 4);

    ctx.restore();
  }
}

/* ==========================================================================
   ENEMIGOS COMUNES
   ========================================================================== */

/**
 * 1. HONGO MUTANTE ZOMBI
 * Se tambalea cómicamente hacia el jugador con sombrero mordisqueado y pústulas de esporas
 */
export class ZombieMushroom extends Entity {
  public health: number;
  public level: number;
  private wobbleTimer = 0;
  private sporeTimer = 0;
  private walkSpeed: number;
  private sporeCooldown: number;
  private sporeSpeed: number;

  constructor(x: number, y: number, level: number = 1) {
    super(x, y, 18, 22);
    this.level = Math.max(1, Math.min(20, level));
    const factor = (this.level - 1) / 19;

    // Escala lineal y dinámica de dificultad
    this.health = Math.round(2 + factor * 5); // 2 HP a 7 HP
    this.walkSpeed = Math.round(55 * (1 + factor * 0.7)); // 55 a 93.5 px/s
    this.sporeCooldown = Math.max(1.2, 3.0 - factor * 1.6); // 3.0s a 1.4s
    this.sporeSpeed = Math.round(90 * (1 + factor * 0.5)); // 90 a 135 px/s

    this.vx = -this.walkSpeed;
    this.facingRight = false;
  }

  public update(dt: number, levelPlatforms: Rect[]): void {
    this.wobbleTimer += dt;
    this.sporeTimer += dt;
    this.vy += 650 * dt;

    this.x += this.vx * dt;
    const prevY = this.y;
    this.y += this.vy * dt;

    this.isGrounded = false;
    for (const plat of levelPlatforms) {
      if (this.vy >= 0 && prevY + this.height <= plat.y + 8 && Entity.checkCollision(this.getBounds(), plat)) {
        this.y = plat.y - this.height;
        this.vy = 0;
        this.isGrounded = true;
        break;
      }
    }
  }

  public tryShootSpore(playerX: number): Bullet | null {
    const dist = Math.abs(playerX - this.x);
    if (dist < 230 && this.sporeTimer > this.sporeCooldown) {
      this.sporeTimer = 0;
      const dirX = playerX > this.x ? 1 : -1;
      return new Bullet({
        x: this.x + 9,
        y: this.y + 2,
        vx: dirX * this.sporeSpeed,
        vy: -75,
        radius: 4,
        damage: 1,
        isEnemy: true,
        color: this.level >= 10 ? '#ff0055' : '#9b30ff',
        type: 'SPORE',
      });
    }
    return null;
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    const sx = Math.floor(this.x - cameraX);
    const sy = Math.floor(this.y - cameraY);

    ctx.save();
    ctx.translate(sx + this.width / 2, sy + this.height);
    if (this.facingRight) ctx.scale(-1, 1);

    // Tambaleo cómico zombi
    const wobbleAngle = Math.sin(this.wobbleTimer * 6) * 0.18;
    ctx.rotate(wobbleAngle);

    // Pies de tallo descompuesto verde grisáceo
    ctx.fillStyle = '#4d5d53';
    ctx.fillRect(-6, -4, 4, 4);
    ctx.fillRect(2, -4, 4, 4);

    // Tallo de hongo zombi
    ctx.fillStyle = '#9cb8a5';
    ctx.fillRect(-6, -12, 12, 8);

    // Ojos saltones zombis asimétricos
    ctx.fillStyle = '#fffa00';
    ctx.fillRect(-5, -11, 4, 4);
    ctx.fillRect(1, -12, 5, 5);
    ctx.fillStyle = '#ff0033'; // Pupilas inyectadas en sangre
    ctx.fillRect(-4, -10, 2, 2);
    ctx.fillRect(2, -11, 2, 2);

    // Sombrero de hongo mutante morado con mordiscos
    ctx.fillStyle = '#6b1182';
    ctx.fillRect(-10, -22, 20, 10);
    ctx.fillRect(-8, -25, 16, 3);

    // Pústulas y manchas tóxicas fluorescentes
    ctx.fillStyle = '#39ff14';
    ctx.fillRect(-7, -21, 3, 3);
    ctx.fillRect(4, -20, 4, 3);
    ctx.fillRect(-2, -24, 3, 2);

    // Mordisco en el ala del hongo
    ctx.fillStyle = '#0a1931'; // Mismo tono del fondo
    ctx.fillRect(7, -19, 3, 4);

    ctx.restore();
  }
}

/**
 * 2. LAGARTO ACORAZADO
 * Con coraza de púas defensiva, pasos firmes y ataque de espinas óseas
 */
export class ArmoredLizard extends Entity {
  public health: number;
  public level: number;
  private shootTimer = 0;
  private walkTimer = 0;
  private isAttacking = false;
  private walkSpeed: number;
  private spikeCooldown: number;
  private spikeSpeed: number;

  constructor(x: number, y: number, level: number = 1) {
    super(x, y, 26, 20);
    this.level = Math.max(1, Math.min(20, level));
    const factor = (this.level - 1) / 19;

    // Escala lineal y dinámica de dificultad
    this.health = Math.round(4 + factor * 8); // 4 HP a 12 HP
    this.walkSpeed = Math.round(45 * (1 + factor * 0.75)); // 45 a 78.7 px/s
    this.spikeCooldown = Math.max(1.1, 2.8 - factor * 1.5); // 2.8s a 1.3s
    this.spikeSpeed = Math.round(170 * (1 + factor * 0.55)); // 170 a 263 px/s

    this.vx = -this.walkSpeed;
    this.facingRight = false;
  }

  public update(dt: number, levelPlatforms: Rect[]): void {
    this.walkTimer += dt;
    this.shootTimer += dt;
    this.vy += 700 * dt;

    if (!this.isAttacking) {
      this.x += this.vx * dt;
    }

    const prevY = this.y;
    this.y += this.vy * dt;

    this.isGrounded = false;
    for (const plat of levelPlatforms) {
      if (this.vy >= 0 && prevY + this.height <= plat.y + 8 && Entity.checkCollision(this.getBounds(), plat)) {
        this.y = plat.y - this.height;
        this.vy = 0;
        this.isGrounded = true;
        break;
      }
    }
  }

  public tryShootSpike(playerX: number): Bullet | null {
    if (this.shootTimer > this.spikeCooldown) {
      this.shootTimer = 0;
      this.isAttacking = true;
      setTimeout(() => (this.isAttacking = false), 350);

      const dirX = playerX > this.x ? 1 : -1;
      this.facingRight = dirX > 0;

      return new Bullet({
        x: this.facingRight ? this.x + this.width + 2 : this.x - 2,
        y: this.y + 10,
        vx: dirX * this.spikeSpeed,
        vy: -20,
        radius: 4,
        damage: 1,
        isEnemy: true,
        color: this.level >= 10 ? '#ffea00' : '#e0d8b0',
        type: 'LIZARD_SPIKE',
      });
    }
    return null;
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    const sx = Math.floor(this.x - cameraX);
    const sy = Math.floor(this.y - cameraY);

    ctx.save();
    ctx.translate(sx + this.width / 2, sy + this.height);
    if (this.facingRight) ctx.scale(-1, 1);

    // Patas acorazadas con garras
    const step = Math.sin(this.walkTimer * 7) * 3;
    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(-10 + step, -5, 6, 5);
    ctx.fillRect(4 - step, -5, 6, 5);

    // Cuerpo reptiliano verde escamoso
    ctx.fillStyle = '#3c7a33';
    ctx.fillRect(-11, -14, 22, 10);

    // Coraza acorazada de placas de hierro y púas
    ctx.fillStyle = '#4a535e';
    ctx.fillRect(-9, -17, 18, 4);

    // Púas defensivas afiladas
    ctx.fillStyle = '#e0d8b0';
    for (let px = -8; px <= 6; px += 4) {
      ctx.beginPath();
      ctx.moveTo(px, -17);
      ctx.lineTo(px + 2, -21);
      ctx.lineTo(px + 4, -17);
      ctx.fill();
    }

    // Cabeza de lagarto con mandíbula
    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(-14, -13, 6, 8);
    // Ojo reptiliano amarillo
    ctx.fillStyle = '#ffe600';
    ctx.fillRect(-12, -12, 2, 2);

    // Fauces abiertas si está atacando
    if (this.isAttacking) {
      ctx.fillStyle = '#ff2233';
      ctx.fillRect(-15, -9, 3, 3);
    }

    // Cola espinosa
    ctx.fillStyle = '#3c7a33';
    ctx.fillRect(10, -11, 6, 4);

    ctx.restore();
  }
}

/* ==========================================================================
   JEFES DE NIVEL HIPERMUSCULOSOS (PARODIAS DEL CHAVO CARTOON)
   ========================================================================== */

/**
 * JEFE 1: "EL CHAVAL"
 * Gigante musculoso con gorra verde a cuadros con orejeras, dentro de un Tanque Barril blindado
 * Lanza Tortas de Jamón explosivas y Cohetes Barril con dos fases de combate.
 */
export class BossElChaval extends Entity implements BossEntity {
  public name = 'EL CHAVAL';
  public subtitle = 'TITÁN DEL BARRIL BLINDADO';
  public health: number;
  public maxHealth: number;
  public isEnraged = false;
  public themeColor = '#ff6b8b';
  public level: number;

  private actionTimer = 0;
  private attackPhase = 0;
  private tankSteamTimer = 0;
  private isCharging = false;
  private chargeDirection = -1;
  private cooldownMultiplier = 1;
  private chargeSpeedMultiplier = 1;

  constructor(x: number, y: number, level: number = 1, customName?: string, customSubtitle?: string) {
    super(x, y, 64, 68); // Tamaño colosal de 16-bits
    this.level = Math.max(1, Math.min(20, level));
    const factor = (this.level - 1) / 19;

    // Escala lineal de resistencia y frecuencia de combate
    this.maxHealth = Math.round(45 + (this.level - 1) * 6.5); // 45 a 168 HP
    this.health = this.maxHealth;
    this.cooldownMultiplier = Math.max(0.45, 1 - factor * 0.5);
    this.chargeSpeedMultiplier = 1 + factor * 0.6;

    if (customName) this.name = customName;
    if (customSubtitle) {
      this.subtitle = customSubtitle;
    } else if (this.level >= 15) {
      this.subtitle = 'CYBER-TITÁN APOCALÍPTICO';
    } else if (this.level >= 10) {
      this.subtitle = 'COMANDANTE DEL BARRIL PESADO';
    } else if (this.level >= 5) {
      this.subtitle = 'BARRIL BLINDADO REFORZADO';
    }
  }

  public update(dt: number, _levelPlatforms?: Rect[]): void {
    this.actionTimer += dt;
    this.tankSteamTimer += dt;

    // Detectar modo Enfurecido (vida < 50%)
    if (this.health <= this.maxHealth * 0.5 && !this.isEnraged) {
      this.isEnraged = true;
      this.subtitle = '¡ENFURECIDO! MASA DESATADA';
      this.themeColor = '#ff0033';
    }

    // Patrón de embestida rodante si está en fase de carga
    if (this.isCharging) {
      const speed = (this.isEnraged ? 190 : 130) * this.chargeSpeedMultiplier;
      this.x += this.chargeDirection * speed * dt;
      if (this.x < 1780) {
        this.chargeDirection = 1;
      } else if (this.x > 2120) {
        this.chargeDirection = -1;
        this.isCharging = false; // Termina la embestida
      }
    } else {
      // Flotación / vaivén de amortiguación del tanque
      this.y = 162 + Math.sin(this.actionTimer * 3) * 3;
    }
  }

  public attack(playerX: number, playerY: number): Bullet[] {
    const bullets: Bullet[] = [];
    const baseCooldown = this.isEnraged ? 1.5 : 2.3;
    const cooldown = baseCooldown * this.cooldownMultiplier;

    if (this.actionTimer >= cooldown) {
      this.actionTimer = 0;
      this.attackPhase = (this.attackPhase + 1) % 3;

      if (this.attackPhase === 0) {
        // ATAQUE 1: Torta de Jamón Explosiva en arco
        const dx = playerX - (this.x + 10);
        const vx = Math.max(-200, Math.min(200, dx * 0.9));
        bullets.push(
          new Bullet({
            x: this.x + 16,
            y: this.y + 10,
            vx,
            vy: -210, // Arco ascendente alto
            radius: 7,
            damage: 1,
            isEnemy: true,
            color: '#ff6b8b',
            type: 'HAM_BOMB',
          })
        );
        SoundSystem.getInstance().playExplosion();

      } else if (this.attackPhase === 1) {
        // ATAQUE 2: Cohete Barril en línea recta horizontal
        bullets.push(
          new Bullet({
            x: this.x - 10,
            y: this.y + 38,
            vx: -240,
            vy: 0,
            radius: 6,
            damage: 1,
            isEnemy: true,
            color: '#8b4513',
            type: 'BARREL_MISSILE',
          })
        );
        SoundSystem.getInstance().playShoot('MACHINEGUN');

      } else {
        // ATAQUE 3: Embestida del Barril Tanque + Ráfaga triple
        this.isCharging = true;
        this.chargeDirection = playerX < this.x ? -1 : 1;

        if (this.isEnraged) {
          // Si está enfurecido, lanza dos tortas de jamón adicionales
          bullets.push(
            new Bullet({
              x: this.x + 10,
              y: this.y + 12,
              vx: -150,
              vy: -180,
              radius: 7,
              damage: 1,
              isEnemy: true,
              color: '#ff6b8b',
              type: 'HAM_BOMB',
            }),
            new Bullet({
              x: this.x + 40,
              y: this.y + 12,
              vx: 150,
              vy: -180,
              radius: 7,
              damage: 1,
              isEnemy: true,
              color: '#ff6b8b',
              type: 'HAM_BOMB',
            })
          );
        }
      }
    }

    return bullets;
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    const sx = Math.floor(this.x - cameraX);
    const sy = Math.floor(this.y - cameraY);

    ctx.save();

    // 1. EL TANQUE BARRIL GIGANTE BLINDADO (Parte inferior)
    // Ruedas/Orugas blindadas con clavos
    ctx.fillStyle = '#22252a';
    ctx.fillRect(sx + 2, sy + 56, 60, 12);
    ctx.fillStyle = '#444c56';
    for (let rx = sx + 6; rx < sx + 56; rx += 10) {
      ctx.beginPath();
      ctx.arc(rx + 4, sy + 62, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tablones de roble del Barril Tanque
    ctx.fillStyle = '#7a3c10';
    ctx.fillRect(sx + 6, sy + 24, 52, 34);

    // Aros de hierro reforzados con remaches dorados
    ctx.fillStyle = '#3a424e';
    ctx.fillRect(sx + 4, sy + 28, 56, 5);
    ctx.fillRect(sx + 4, sy + 46, 56, 5);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(sx + 10, sy + 29, 3, 3);
    ctx.fillRect(sx + 30, sy + 29, 3, 3);
    ctx.fillRect(sx + 50, sy + 29, 3, 3);

    // Cañón del Tanque Barril
    ctx.fillStyle = '#1e2229';
    ctx.fillRect(sx - 8, sy + 36, 14, 10);
    ctx.fillStyle = '#57606a';
    ctx.fillRect(sx - 10, sy + 35, 4, 12);

    // 2. EL GIGANTE HIPERMUSCULOSO "EL CHAVAL" (Asomándose del barril)
    // Hombros y Bíceps monstruosos
    ctx.fillStyle = '#f0ad79';
    ctx.fillRect(sx + 8, sy + 10, 16, 15);
    ctx.fillRect(sx + 40, sy + 10, 16, 15);
    ctx.fillStyle = '#bf6d37'; // Sombra muscular
    ctx.fillRect(sx + 14, sy + 14, 4, 8);
    ctx.fillRect(sx + 44, sy + 14, 4, 8);

    // Pectorales asomándose
    ctx.fillStyle = '#f0ad79';
    ctx.fillRect(sx + 22, sy + 12, 20, 13);
    ctx.fillStyle = '#bf6d37';
    ctx.fillRect(sx + 31, sy + 12, 2, 13);

    // Camiseta blanca rasgada con tirante de cuerda
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sx + 20, sy + 16, 8, 4);
    ctx.fillRect(sx + 36, sy + 16, 8, 4);

    // Cabeza y Rostro Paródico
    ctx.fillStyle = '#f0ad79';
    ctx.fillRect(sx + 24, sy - 2, 16, 15);

    // Pecas cómicas
    ctx.fillStyle = '#a65922';
    ctx.fillRect(sx + 26, sy + 7, 2, 2);
    ctx.fillRect(sx + 36, sy + 7, 2, 2);

    // Ojos desafiantes de combate
    ctx.fillStyle = '#000000';
    ctx.fillRect(sx + 27, sy + 3, 3, 3);
    ctx.fillRect(sx + 34, sy + 3, 3, 3);

    // Gorra verde a cuadros con orejeras icónica (16-bits)
    ctx.fillStyle = '#2d7a3e'; // Verde base
    ctx.fillRect(sx + 22, sy - 9, 20, 8);
    // Orejeras laterales caídas
    ctx.fillRect(sx + 20, sy - 5, 4, 12);
    ctx.fillRect(sx + 40, sy - 5, 4, 12);

    // Trama de cuadros marrones y verdes
    ctx.fillStyle = '#614327';
    ctx.fillRect(sx + 24, sy - 8, 4, 3);
    ctx.fillRect(sx + 32, sy - 8, 4, 3);
    ctx.fillRect(sx + 28, sy - 5, 4, 3);
    ctx.fillRect(sx + 36, sy - 5, 4, 3);

    // Visera de la gorra proyectada hacia adelante
    ctx.fillStyle = '#1e522a';
    ctx.fillRect(sx + 18, sy - 3, 10, 3);

    // Vapor cómico de escape del tanque
    if (Math.sin(this.tankSteamTimer * 8) > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(sx + 58, sy + 22, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

/**
 * JEFE 2: "DON RAMFIS"
 * Jefe ágil con abdominales de acero, bigote rudo y sombreros filosos bumerán
 */
export class BossDonRamfis extends Entity implements BossEntity {
  public name = 'DON RAMFIS';
  public subtitle = 'ABDOMINALES DE ACERO';
  public health: number;
  public maxHealth: number;
  public isEnraged = false;
  public themeColor = '#00f0ff';
  public level: number;

  private actionTimer = 0;
  private attackPhase = 0;
  private walkSpeed = 110;
  private jumpTimer = 0;
  private hasHatOn = true;
  private cooldownMultiplier = 1;

  constructor(x: number, y: number, level: number = 1, customName?: string, customSubtitle?: string) {
    super(x, y, 22, 34); // Ágil y fibroso
    this.level = Math.max(1, Math.min(20, level));
    const factor = (this.level - 1) / 19;

    // Escala lineal de resistencia y frecuencia de combate
    this.maxHealth = Math.round(40 + (this.level - 1) * 6.2); // 40 a 158 HP
    this.health = this.maxHealth;
    this.walkSpeed = Math.round(110 * (1 + factor * 0.45));
    this.cooldownMultiplier = Math.max(0.45, 1 - factor * 0.48);

    this.vx = -this.walkSpeed;
    this.facingRight = false;

    if (customName) this.name = customName;
    if (customSubtitle) {
      this.subtitle = customSubtitle;
    } else if (this.level >= 15) {
      this.subtitle = 'SEÑOR DEL APOCALIPSIS';
    } else if (this.level >= 10) {
      this.subtitle = 'TITÁN MAGMÁTICO DEL BOXEO';
    } else if (this.level >= 5) {
      this.subtitle = 'FURIA DE ACERO CALLEJERA';
    }
  }

  public update(dt: number, levelPlatforms: Rect[]): void {
    this.actionTimer += dt;
    this.jumpTimer += dt;
    this.vy += 750 * dt;

    // Detectar modo Enfurecido (vida < 50%)
    if (this.health <= this.maxHealth * 0.5 && !this.isEnraged) {
      this.isEnraged = true;
      this.subtitle = '¡FURIOSO! NO TE DOY OTRA NO MÁS...';
      this.themeColor = '#ff2255';
      this.walkSpeed = Math.round(155 * (1 + (this.level - 1) / 19 * 0.4)); // Gran aumento de velocidad
    }

    // Movimiento ágil de ida y vuelta
    this.x += this.vx * dt;
    if (this.x < 1800) {
      this.vx = this.walkSpeed;
      this.facingRight = true;
    } else if (this.x > 2140) {
      this.vx = -this.walkSpeed;
      this.facingRight = false;
    }

    // Saltos ágiles de parkour
    const jumpInterval = (this.isEnraged ? 1.6 : 2.4) * this.cooldownMultiplier;
    if (this.isGrounded && this.jumpTimer > jumpInterval) {
      this.jumpTimer = 0;
      this.vy = -340;
      this.isGrounded = false;
      SoundSystem.getInstance().playJump();
    }

    // Colisión de suelo
    const prevY = this.y;
    this.y += this.vy * dt;
    this.isGrounded = false;

    for (const plat of levelPlatforms) {
      if (this.vy >= 0 && prevY + this.height <= plat.y + 8 && Entity.checkCollision(this.getBounds(), plat)) {
        this.y = plat.y - this.height;
        this.vy = 0;
        this.isGrounded = true;
        break;
      }
    }
  }

  public attack(playerX: number, playerY: number): Bullet[] {
    const bullets: Bullet[] = [];
    const baseCooldown = this.isEnraged ? 1.4 : 2.2;
    const cooldown = baseCooldown * this.cooldownMultiplier;

    if (this.actionTimer >= cooldown) {
      this.actionTimer = 0;
      this.attackPhase = (this.attackPhase + 1) % 2;

      // Lanzamiento del Sombrero Bumerán Filoso
      this.hasHatOn = false;
      setTimeout(() => (this.hasHatOn = true), 1600); // El sombrero regresa tras el recorrido

      const dirX = playerX < this.x ? -1 : 1;
      this.facingRight = dirX > 0;

      bullets.push(
        new Bullet({
          x: this.x + 10,
          y: this.y + 6,
          vx: dirX * 260,
          vy: -30,
          radius: 8,
          damage: 1,
          isEnemy: true,
          color: '#4a75a0',
          type: 'BOOMERANG_HAT',
          originX: this.x,
          originY: this.y,
        })
      );

      // Si está enfurecido, lanza un segundo sombrero de rebote
      if (this.isEnraged) {
        setTimeout(() => {
          bullets.push(
            new Bullet({
              x: this.x + 10,
              y: this.y + 6,
              vx: dirX * 220,
              vy: 40,
              radius: 8,
              damage: 1,
              isEnemy: true,
              color: '#ff2255',
              type: 'BOOMERANG_HAT',
              originX: this.x,
              originY: this.y,
            })
          );
        }, 300);
      }

      SoundSystem.getInstance().playShoot('SPREAD');
    }

    return bullets;
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    const sx = Math.floor(this.x - cameraX);
    const sy = Math.floor(this.y - cameraY);

    ctx.save();
    ctx.translate(sx + this.width / 2, sy + this.height);
    if (!this.facingRight) ctx.scale(-1, 1);

    // Zapatillas gastadas y vaqueros azules
    const walk = Math.sin(Date.now() / 70) * 4;
    ctx.fillStyle = '#2c4d6f'; // Vaqueros
    ctx.fillRect(-7 + walk, -14, 5, 10);
    ctx.fillRect(2 - walk, -14, 5, 10);

    ctx.fillStyle = '#ffffff'; // Zapatillas
    ctx.fillRect(-7 + walk, -4, 6, 4);
    ctx.fillRect(2 - walk, -4, 6, 4);

    // Cinturón de cuero
    ctx.fillStyle = '#2b1d0c';
    ctx.fillRect(-8, -16, 16, 3);

    // TORSO CON ABDOMINALES DE ACERO FIBROSOS (16-bits)
    ctx.fillStyle = '#f0ad79';
    ctx.fillRect(-8, -26, 16, 11);

    // Definición extrema de abdominales marcados en acero
    ctx.fillStyle = '#a65922';
    ctx.fillRect(-6, -24, 4, 3);
    ctx.fillRect(2, -24, 4, 3);
    ctx.fillRect(-6, -20, 4, 3);
    ctx.fillRect(2, -20, 4, 3);
    ctx.fillRect(-1, -26, 2, 10); // Línea alba

    // Camiseta negra ajustada rasgada mostrando bíceps secos
    ctx.fillStyle = '#1c1f24';
    ctx.fillRect(-8, -29, 16, 4);
    ctx.fillRect(-8, -27, 4, 3);

    // Brazos fibrosos con venas marcadas
    ctx.fillStyle = '#f0ad79';
    ctx.fillRect(-11, -28, 4, 11);
    ctx.fillRect(7, -28, 4, 11);

    if (this.isEnraged) {
      // Venas rojas de furia
      ctx.fillStyle = '#ff0033';
      ctx.fillRect(-10, -25, 2, 4);
      ctx.fillRect(8, -25, 2, 4);
    }

    // Cuello y Cabeza
    ctx.fillStyle = '#f0ad79';
    ctx.fillRect(-5, -36, 10, 8);

    // Bigote caído clásico de Don Ramfis
    ctx.fillStyle = '#1a0d00';
    ctx.fillRect(-4, -31, 8, 3);
    ctx.fillRect(-5, -30, 2, 3);
    ctx.fillRect(3, -30, 2, 3);

    // Ojos furiosos
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, -35, 4, 3);
    ctx.fillStyle = this.isEnraged ? '#ff0000' : '#000000';
    ctx.fillRect(1, -35, 2, 2);

    // Sombrero de pescador azul o cabeza rapada si lo arrojó
    if (this.hasHatOn) {
      ctx.fillStyle = '#4a75a0'; // Copa azul
      ctx.fillRect(-7, -41, 14, 6);
      ctx.fillStyle = '#3a628a'; // Ala del sombrero
      ctx.fillRect(-9, -36, 18, 3);
    } else {
      // Calvicie paródica momentánea con 3 pelos
      ctx.fillStyle = '#1a0d00';
      ctx.fillRect(-4, -38, 2, 2);
      ctx.fillRect(0, -39, 2, 3);
      ctx.fillRect(3, -38, 2, 2);
    }

    ctx.restore();
  }
}

/* ==========================================================================
   JEFES ANIMATRÓNICOS DE FIVE NIGHTS AT FREDDY'S (HIPERMUSCULOSOS)
   ========================================================================== */

/**
 * JEFE 3: "FREDDY FAZBEAR (EL OSO METRALLA)"
 * Oso animatrónico colosal hipermusculoso marrón, con sombrero de copa táctico,
 * ojos brillantes y cañón minigun que dispara notas musicales explosivas.
 */
export class BossFreddyFazbear extends Entity implements BossEntity {
  public name = 'FREDDY FAZBEAR';
  public subtitle = 'EL OSO METRALLA';
  public health: number;
  public maxHealth: number;
  public isEnraged = false;
  public themeColor = '#d97706'; // Tono ámbar/dorado oscuro
  public level: number;

  private actionTimer = 0;
  private attackPhase = 0;
  private walkSpeed = 65;
  private isCharging = false;
  private chargeDirection = -1;
  private cooldownMultiplier = 1;

  constructor(x: number, y: number, level: number = 1, customName?: string, customSubtitle?: string) {
    super(x, y, 58, 68);
    this.level = Math.max(1, Math.min(20, level));
    const factor = (this.level - 1) / 19;

    this.maxHealth = Math.round(48 + (this.level - 1) * 6.8); // 48 a 177 HP
    this.health = this.maxHealth;
    this.cooldownMultiplier = Math.max(0.45, 1 - factor * 0.48);

    this.vx = -this.walkSpeed;
    this.facingRight = false;

    if (customName) this.name = customName;
    if (customSubtitle) {
      this.subtitle = customSubtitle;
    } else if (this.level >= 15) {
      this.subtitle = 'PESADILLA DE TITANIO CIBERNÉTICA';
    } else if (this.level >= 10) {
      this.subtitle = 'SINFONÍA DESTRUCCIÓN TOTAL';
    } else if (this.level >= 5) {
      this.subtitle = 'BÍCEPS DE ENDOESQUELETO';
    }
  }

  public update(dt: number, levelPlatforms: Rect[]): void {
    this.actionTimer += dt;
    this.vy += 700 * dt;

    if (this.health <= this.maxHealth * 0.5 && !this.isEnraged) {
      this.isEnraged = true;
      this.subtitle = '¡RABIA NOCTURNA! MORDISCO DEL 87';
      this.themeColor = '#ef4444';
      this.walkSpeed = 120;
    }

    if (this.isCharging) {
      this.x += this.chargeDirection * (this.isEnraged ? 210 : 150) * dt;
      if (this.x < 1780) {
        this.chargeDirection = 1;
        this.facingRight = true;
      } else if (this.x > 2140) {
        this.chargeDirection = -1;
        this.facingRight = false;
        this.isCharging = false;
      }
    } else {
      this.x += this.vx * dt;
      if (this.x < 1820) {
        this.vx = this.walkSpeed;
        this.facingRight = true;
      } else if (this.x > 2120) {
        this.vx = -this.walkSpeed;
        this.facingRight = false;
      }
    }

    const prevY = this.y;
    this.y += this.vy * dt;
    this.isGrounded = false;

    for (const plat of levelPlatforms) {
      if (this.vy >= 0 && prevY + this.height <= plat.y + 8 && Entity.checkCollision(this.getBounds(), plat)) {
        this.y = plat.y - this.height;
        this.vy = 0;
        this.isGrounded = true;
        break;
      }
    }
  }

  public attack(playerX: number, playerY: number): Bullet[] {
    const bullets: Bullet[] = [];
    const baseCooldown = this.isEnraged ? 1.4 : 2.2;
    const cooldown = baseCooldown * this.cooldownMultiplier;

    if (this.actionTimer >= cooldown) {
      this.actionTimer = 0;
      this.attackPhase = (this.attackPhase + 1) % 3;

      const dirX = playerX < this.x ? -1 : 1;
      this.facingRight = dirX > 0;

      if (this.attackPhase === 0) {
        // ATAQUE 1: Ráfaga de notas musicales explosivas
        SoundSystem.getInstance().playShoot('MACHINEGUN');
        const spreads = [-35, 0, 35];
        for (const angleOffset of spreads) {
          bullets.push(
            new Bullet({
              x: this.facingRight ? this.x + this.width : this.x,
              y: this.y + 28,
              vx: dirX * (220 + Math.abs(angleOffset)),
              vy: angleOffset,
              radius: 6,
              damage: 1,
              isEnemy: true,
              color: '#ffd700',
              type: 'FREDDY_MUSIC_NOTE',
            })
          );
        }
      } else if (this.attackPhase === 1) {
        // ATAQUE 2: Disparo de precisión sónico
        SoundSystem.getInstance().playShoot('LASER');
        bullets.push(
          new Bullet({
            x: this.facingRight ? this.x + this.width : this.x,
            y: this.y + 24,
            vx: dirX * 280,
            vy: -15,
            radius: 8,
            damage: 1,
            isEnemy: true,
            color: '#ef4444',
            type: 'FREDDY_MUSIC_NOTE',
          })
        );
      } else {
        // ATAQUE 3: Embestida de Oso Titánico
        this.isCharging = true;
        this.chargeDirection = dirX;
        SoundSystem.getInstance().playExplosion();
      }
    }

    return bullets;
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    const sx = Math.floor(this.x - cameraX);
    const sy = Math.floor(this.y - cameraY);

    ctx.save();
    ctx.translate(sx + this.width / 2, sy + this.height);
    if (!this.facingRight) ctx.scale(-1, 1);

    // Piernas animatrónicas musculosas marrones con placas metálicas
    const walk = Math.sin(Date.now() / 90) * 3;
    ctx.fillStyle = '#4a2810';
    ctx.fillRect(-18 + walk, -16, 12, 16);
    ctx.fillRect(6 - walk, -16, 12, 16);
    // Articulaciones de endoesqueleto
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-14 + walk, -10, 4, 4);
    ctx.fillRect(10 - walk, -10, 4, 4);

    // Torso gigante hipermusculoso
    ctx.fillStyle = '#633311'; // Pelaje marrón principal
    ctx.fillRect(-20, -42, 40, 28);

    // Vientre tostado claro marcado con abdominales animatrónicos
    ctx.fillStyle = '#a16226';
    ctx.fillRect(-12, -38, 24, 22);
    ctx.fillStyle = '#452107';
    ctx.fillRect(-1, -38, 2, 22); // Línea alba
    ctx.fillRect(-10, -30, 20, 2);

    // Pajarita negra de Freddy
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-5, -45, 10, 4);
    ctx.fillRect(-7, -46, 4, 6);
    ctx.fillRect(3, -46, 4, 6);

    // Bíceps colosales con cables expuestos
    ctx.fillStyle = '#633311';
    ctx.fillRect(-28, -42, 10, 20); // Brazo trasero
    ctx.fillRect(18, -42, 12, 22);  // Brazo frontal con minigun

    // Cables y endoesqueleto cromado
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(20, -34, 8, 4);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(22, -36, 4, 2);

    // Micrófono / Minigun acoplado en mano
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(24, -26, 16, 10);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(38, -25, 6, 8);

    // Cabeza y mandíbula colosal
    ctx.fillStyle = '#633311';
    ctx.fillRect(-16, -60, 32, 20);

    // Hocico marrón claro
    ctx.fillStyle = '#a16226';
    ctx.fillRect(-10, -52, 20, 11);
    ctx.fillStyle = '#0f172a'; // Nariz negra
    ctx.fillRect(-3, -53, 6, 4);

    // Dientes de endoesqueleto
    ctx.fillStyle = '#ffffff';
    for (let tx = -8; tx <= 6; tx += 4) {
      ctx.fillRect(tx, -43, 2, 3);
    }

    // Ojos tácticos de combate con brillo
    ctx.fillStyle = '#000000'; // Cuenca oscura
    ctx.fillRect(-12, -58, 8, 7);
    ctx.fillRect(4, -58, 8, 7);

    // Pupila brillante (azul neón normal, roja al enfurecerse)
    ctx.fillStyle = this.isEnraged ? '#ff0033' : '#00f0ff';
    ctx.fillRect(-9, -56, 4, 4);
    ctx.fillRect(7, -56, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-8, -55, 2, 2);
    ctx.fillRect(8, -55, 2, 2);

    // Orejas de oso redondas
    ctx.fillStyle = '#633311';
    ctx.fillRect(-18, -66, 8, 8);
    ctx.fillRect(10, -66, 8, 8);
    ctx.fillStyle = '#a16226';
    ctx.fillRect(-16, -64, 4, 4);
    ctx.fillRect(12, -64, 4, 4);

    // Sombrero de copa táctico negro con cinta roja
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-10, -62, 20, 3); // Ala
    ctx.fillRect(-6, -72, 12, 10); // Copa
    ctx.fillStyle = '#dc2626'; // Cinta roja
    ctx.fillRect(-6, -64, 12, 2);

    ctx.restore();
  }
}

/**
 * JEFE 4: "BONNIE EL CONEJO (EL GUITARRISTA ACORAZADO)"
 * Conejo morado hipermusculoso con orejas biónicas, corbatín rojo,
 * guitarra Flying-V que dispara láseres y teletransporte digital.
 */
export class BossBonnie extends Entity implements BossEntity {
  public name = 'BONNIE';
  public subtitle = 'EL GUITARRISTA ACORAZADO';
  public health: number;
  public maxHealth: number;
  public isEnraged = false;
  public themeColor = '#a855f7'; // Púrpura eléctrico
  public level: number;

  private actionTimer = 0;
  private teleportTimer = 0;
  private attackPhase = 0;
  private walkSpeed = 95;
  private isTeleporting = false;
  private cooldownMultiplier = 1;

  constructor(x: number, y: number, level: number = 1, customName?: string, customSubtitle?: string) {
    super(x, y, 48, 70);
    this.level = Math.max(1, Math.min(20, level));
    const factor = (this.level - 1) / 19;

    this.maxHealth = Math.round(44 + (this.level - 1) * 6.4); // 44 a 165 HP
    this.health = this.maxHealth;
    this.cooldownMultiplier = Math.max(0.45, 1 - factor * 0.48);

    this.vx = -this.walkSpeed;
    this.facingRight = false;

    if (customName) this.name = customName;
    if (customSubtitle) {
      this.subtitle = customSubtitle;
    } else if (this.level >= 15) {
      this.subtitle = 'TELETRANSPORTE CUÁNTICO EXTREMO';
    } else if (this.level >= 10) {
      this.subtitle = 'SOLO DE GUITARRA CORROSIVO';
    } else if (this.level >= 5) {
      this.subtitle = 'OVERDRIVE ELÉCTRICO';
    }
  }

  public update(dt: number, levelPlatforms: Rect[]): void {
    this.actionTimer += dt;
    this.teleportTimer += dt;
    this.vy += 700 * dt;

    if (this.health <= this.maxHealth * 0.5 && !this.isEnraged) {
      this.isEnraged = true;
      this.subtitle = '¡OVERCLOCK DE GUITARRA! VELOCIDAD GLITCH';
      this.themeColor = '#ff00aa';
      this.walkSpeed = 145;
    }

    // Teletransporte Glitch periódico
    const tpCooldown = (this.isEnraged ? 2.5 : 4.0) * this.cooldownMultiplier;
    if (this.teleportTimer > tpCooldown) {
      this.teleportTimer = 0;
      this.isTeleporting = true;

      setTimeout(() => {
        // Salto dimensional al otro extremo de la arena
        this.x = this.x > 1950 ? 1790 : 2100;
        this.isTeleporting = false;
        SoundSystem.getInstance().playJump();
      }, 200);
    }

    if (!this.isTeleporting) {
      this.x += this.vx * dt;
      if (this.x < 1780) {
        this.vx = this.walkSpeed;
        this.facingRight = true;
      } else if (this.x > 2140) {
        this.vx = -this.walkSpeed;
        this.facingRight = false;
      }
    }

    const prevY = this.y;
    this.y += this.vy * dt;
    this.isGrounded = false;

    for (const plat of levelPlatforms) {
      if (this.vy >= 0 && prevY + this.height <= plat.y + 8 && Entity.checkCollision(this.getBounds(), plat)) {
        this.y = plat.y - this.height;
        this.vy = 0;
        this.isGrounded = true;
        break;
      }
    }
  }

  public attack(playerX: number, playerY: number): Bullet[] {
    const bullets: Bullet[] = [];
    const baseCooldown = this.isEnraged ? 1.3 : 2.1;
    const cooldown = baseCooldown * this.cooldownMultiplier;

    if (this.actionTimer >= cooldown && !this.isTeleporting) {
      this.actionTimer = 0;
      this.attackPhase = (this.attackPhase + 1) % 2;

      const dirX = playerX < this.x ? -1 : 1;
      this.facingRight = dirX > 0;

      SoundSystem.getInstance().playShoot('LASER');

      // Descarga de rayos láser desde el clavijero de la guitarra
      bullets.push(
        new Bullet({
          x: this.facingRight ? this.x + this.width + 4 : this.x - 4,
          y: this.y + 28,
          vx: dirX * 300,
          vy: -20,
          radius: 7,
          damage: 1,
          isEnemy: true,
          color: '#00f0ff',
          type: 'BONNIE_LASER_BEAM',
        })
      );

      if (this.isEnraged) {
        // En furia, disparo triple en abanico
        bullets.push(
          new Bullet({
            x: this.facingRight ? this.x + this.width + 4 : this.x - 4,
            y: this.y + 24,
            vx: dirX * 280,
            vy: -80,
            radius: 6,
            damage: 1,
            isEnemy: true,
            color: '#a855f7',
            type: 'BONNIE_LASER_BEAM',
          }),
          new Bullet({
            x: this.facingRight ? this.x + this.width + 4 : this.x - 4,
            y: this.y + 32,
            vx: dirX * 280,
            vy: 50,
            radius: 6,
            damage: 1,
            isEnemy: true,
            color: '#a855f7',
            type: 'BONNIE_LASER_BEAM',
          })
        );
      }
    }

    return bullets;
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    if (this.isTeleporting) {
      // Efecto glitch de estática digital
      const sx = Math.floor(this.x - cameraX);
      const sy = Math.floor(this.y - cameraY);
      ctx.fillStyle = '#00f0ff';
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(sx + Math.random() * 40, sy + Math.random() * 60, 10, 2);
      }
      return;
    }

    const sx = Math.floor(this.x - cameraX);
    const sy = Math.floor(this.y - cameraY);

    ctx.save();
    ctx.translate(sx + this.width / 2, sy + this.height);
    if (!this.facingRight) ctx.scale(-1, 1);

    // Piernas moradas con placas de armadura
    const walk = Math.sin(Date.now() / 80) * 4;
    ctx.fillStyle = '#581c87';
    ctx.fillRect(-15 + walk, -16, 10, 16);
    ctx.fillRect(5 - walk, -16, 10, 16);

    // Torso hipermusculoso lavanda/púrpura
    ctx.fillStyle = '#7e22ce';
    ctx.fillRect(-16, -44, 32, 28);
    ctx.fillStyle = '#a855f7'; // Músculos pectorales
    ctx.fillRect(-12, -40, 24, 12);
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(-1, -40, 2, 24);

    // Corbatín rojo escarlata
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-4, -46, 8, 4);
    ctx.fillRect(-6, -47, 3, 6);
    ctx.fillRect(3, -47, 3, 6);

    // Brazos colosales
    ctx.fillStyle = '#7e22ce';
    ctx.fillRect(-22, -44, 8, 22);
    ctx.fillRect(14, -44, 10, 24);

    // Guitarra Flying-V eléctrica acorazada
    ctx.fillStyle = '#dc2626'; // Cuerpo en V rojo
    ctx.beginPath();
    ctx.moveTo(12, -40);
    ctx.lineTo(34, -20);
    ctx.lineTo(24, -14);
    ctx.closePath();
    ctx.fill();

    // Mástil de la guitarra / Cañón láser
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(20, -38, 20, 5);
    ctx.fillStyle = '#00f0ff'; // Pastillas y cuerdas de energía
    ctx.fillRect(16, -28, 8, 3);
    ctx.fillRect(36, -39, 4, 7);

    // Cabeza y mandíbula de conejo
    ctx.fillStyle = '#7e22ce';
    ctx.fillRect(-14, -62, 28, 20);

    // Hocico lavanda claro
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(-8, -54, 16, 10);
    ctx.fillStyle = '#3b0764'; // Nariz
    ctx.fillRect(-2, -54, 4, 3);

    // Dientes de endoesqueleto
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, -46, 3, 3);
    ctx.fillRect(3, -46, 3, 3);

    // Ojos magenta brillantes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-10, -58, 6, 6);
    ctx.fillRect(4, -58, 6, 6);
    ctx.fillStyle = this.isEnraged ? '#ff0033' : '#f43f5e';
    ctx.fillRect(-8, -56, 3, 3);
    ctx.fillRect(6, -56, 3, 3);

    // Orejas largas biónicas articuladas
    ctx.fillStyle = '#7e22ce';
    ctx.fillRect(-12, -78, 6, 16);
    ctx.fillRect(6, -78, 6, 16);
    // Articulaciones metálicas de las orejas
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-12, -72, 6, 2);
    ctx.fillRect(6, -72, 6, 2);
    // Interior rosa
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(-10, -76, 2, 10);
    ctx.fillRect(8, -76, 2, 10);

    ctx.restore();
  }
}

/**
 * JEFE 5: "CHICA Y MR. CUPCAKE MUTANTE"
 * Gallina de combate hipermusculosa amarilla con babero rasgado "LET'S EAT",
 * pico afilado y Mr. Cupcake mutante que arroja bombas de vapor tóxico corrosivo.
 */
export class BossChica extends Entity implements BossEntity {
  public name = 'CHICA';
  public subtitle = '& MR. CUPCAKE MUTANTE';
  public health: number;
  public maxHealth: number;
  public isEnraged = false;
  public themeColor = '#eab308'; // Amarillo brillante
  public level: number;

  private actionTimer = 0;
  private attackPhase = 0;
  private walkSpeed = 80;
  private peckTimer = 0;
  private cooldownMultiplier = 1;

  constructor(x: number, y: number, level: number = 1, customName?: string, customSubtitle?: string) {
    super(x, y, 54, 66);
    this.level = Math.max(1, Math.min(20, level));
    const factor = (this.level - 1) / 19;

    this.maxHealth = Math.round(45 + (this.level - 1) * 6.5); // 45 a 168 HP
    this.health = this.maxHealth;
    this.cooldownMultiplier = Math.max(0.45, 1 - factor * 0.48);

    this.vx = -this.walkSpeed;
    this.facingRight = false;

    if (customName) this.name = customName;
    if (customSubtitle) {
      this.subtitle = customSubtitle;
    } else if (this.level >= 15) {
      this.subtitle = 'VAPOR QUÍMICO APOCALÍPTICO';
    } else if (this.level >= 10) {
      this.subtitle = 'FURIA DEL BANQUETE MUTANTE';
    } else if (this.level >= 5) {
      this.subtitle = 'HORNO DE COMBATE TÓXICO';
    }
  }

  public update(dt: number, levelPlatforms: Rect[]): void {
    this.actionTimer += dt;
    this.peckTimer += dt;
    this.vy += 700 * dt;

    if (this.health <= this.maxHealth * 0.5 && !this.isEnraged) {
      this.isEnraged = true;
      this.subtitle = '¡LET\'S KILL! FURIA ÁCIDA';
      this.themeColor = '#f43f5e';
      this.walkSpeed = 135;
    }

    this.x += this.vx * dt;
    if (this.x < 1790) {
      this.vx = this.walkSpeed;
      this.facingRight = true;
    } else if (this.x > 2130) {
      this.vx = -this.walkSpeed;
      this.facingRight = false;
    }

    const prevY = this.y;
    this.y += this.vy * dt;
    this.isGrounded = false;

    for (const plat of levelPlatforms) {
      if (this.vy >= 0 && prevY + this.height <= plat.y + 8 && Entity.checkCollision(this.getBounds(), plat)) {
        this.y = plat.y - this.height;
        this.vy = 0;
        this.isGrounded = true;
        break;
      }
    }
  }

  public attack(playerX: number, playerY: number): Bullet[] {
    const bullets: Bullet[] = [];
    const baseCooldown = this.isEnraged ? 1.4 : 2.2;
    const cooldown = baseCooldown * this.cooldownMultiplier;

    if (this.actionTimer >= cooldown) {
      this.actionTimer = 0;
      this.attackPhase = (this.attackPhase + 1) % 3;

      const dirX = playerX < this.x ? -1 : 1;
      this.facingRight = dirX > 0;

      if (this.attackPhase === 0) {
        // ATAQUE 1: Bomba de Mr. Cupcake en arco
        SoundSystem.getInstance().playShoot('BANANA');
        const dx = playerX - (this.x + 10);
        const vx = Math.max(-220, Math.min(220, dx * 0.95));
        bullets.push(
          new Bullet({
            x: this.facingRight ? this.x + 36 : this.x + 10,
            y: this.y + 20,
            vx,
            vy: -220,
            radius: 8,
            damage: 1,
            isEnemy: true,
            color: '#f43f5e',
            type: 'CHICA_CUPCAKE_BOMB',
          })
        );
      } else if (this.attackPhase === 1) {
        // ATAQUE 2: Ráfaga de vapor tóxico corrosivo
        SoundSystem.getInstance().playShoot('SPREAD');
        for (let i = 0; i < 3; i++) {
          bullets.push(
            new Bullet({
              x: this.facingRight ? this.x + this.width : this.x,
              y: this.y + 24 + i * 8,
              vx: dirX * (180 + i * 30),
              vy: -20 + i * 20,
              radius: 6,
              damage: 1,
              isEnemy: true,
              color: '#4ade80',
              type: 'CHICA_TOXIC_STEAM',
            })
          );
        }
      } else {
        // ATAQUE 3: Doble Cupcake de rebote si está furiosa
        SoundSystem.getInstance().playExplosion();
        bullets.push(
          new Bullet({
            x: this.x + 20,
            y: this.y + 10,
            vx: -160,
            vy: -190,
            radius: 7,
            damage: 1,
            isEnemy: true,
            color: '#f43f5e',
            type: 'CHICA_CUPCAKE_BOMB',
          }),
          new Bullet({
            x: this.x + 30,
            y: this.y + 10,
            vx: 160,
            vy: -190,
            radius: 7,
            damage: 1,
            isEnemy: true,
            color: '#f43f5e',
            type: 'CHICA_CUPCAKE_BOMB',
          })
        );
      }
    }

    return bullets;
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    const sx = Math.floor(this.x - cameraX);
    const sy = Math.floor(this.y - cameraY);

    ctx.save();
    ctx.translate(sx + this.width / 2, sy + this.height);
    if (!this.facingRight) ctx.scale(-1, 1);

    // Patas de gallina naranjas musculosas con garras
    const walk = Math.sin(Date.now() / 85) * 3;
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-15 + walk, -14, 10, 14);
    ctx.fillRect(5 - walk, -14, 10, 14);
    // Garras
    ctx.fillStyle = '#fdba74';
    ctx.fillRect(-17 + walk, -3, 14, 3);
    ctx.fillRect(3 - walk, -3, 14, 3);

    // Torso hipertrofiado amarillo
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(-18, -42, 36, 28);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-14, -38, 28, 14);

    // Babero táctico desgarrado "LET'S EAT"
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-12, -36, 24, 18);
    ctx.fillStyle = '#ef4444'; // Texto pixelado simulado
    ctx.fillRect(-9, -32, 18, 3);
    ctx.fillRect(-7, -27, 14, 3);

    // Brazos con bíceps descomunales y muñequeras con púas
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-24, -42, 8, 20);
    ctx.fillRect(16, -42, 10, 22);

    // Muñequeras de combate con púas
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-24, -28, 8, 4);
    ctx.fillRect(16, -28, 10, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-23, -29, 2, 2);
    ctx.fillRect(20, -29, 2, 2);

    // MR. CUPCAKE MUTANTE EN LA MANO DE CHICA
    const cupcakeY = -34 + Math.sin(Date.now() / 120) * 3;
    ctx.fillStyle = '#475569'; // Base metálica
    ctx.fillRect(22, cupcakeY + 8, 12, 6);
    ctx.fillStyle = '#f43f5e'; // Glaseado rosa
    ctx.fillRect(20, cupcakeY + 2, 16, 8);
    // Ojos saltones desquiciados
    ctx.fillStyle = '#facc15';
    ctx.fillRect(22, cupcakeY + 4, 3, 3);
    ctx.fillRect(29, cupcakeY + 4, 3, 3);
    ctx.fillStyle = '#000000';
    ctx.fillRect(23, cupcakeY + 5, 1, 1);
    ctx.fillRect(30, cupcakeY + 5, 1, 1);
    // Vela con fuego violeta
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(27, cupcakeY - 2, 2, 4);
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(26, cupcakeY - 6, 4, 4);

    // Cabeza y pico de Chica
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-15, -60, 30, 20);

    // Pico naranja con dientes metálicos
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(0, -52, 18, 9);
    ctx.fillStyle = '#ffffff';
    for (let px = 2; px <= 14; px += 4) {
      ctx.fillRect(px, -49, 2, 3);
    }

    // Ojos morados / rosados
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-11, -57, 7, 7);
    ctx.fillRect(1, -57, 7, 7);
    ctx.fillStyle = this.isEnraged ? '#ff0033' : '#a855f7';
    ctx.fillRect(-8, -55, 3, 3);
    ctx.fillRect(4, -55, 3, 3);

    // Mechón de plumas en la cresta
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-4, -66, 8, 6);
    ctx.fillRect(-2, -70, 4, 4);

    ctx.restore();
  }
}

/**
 * JEFE 6: "FOXY EL ZORRO PIRATA"
 * Zorro animatrónico carmesí hipermusculoso con garfio afilado, pata de palo
 * biónica, cañón en el brazo y sprint fulgurante a hipervelocidad ("Pirate Cove Sprint").
 */
export class BossFoxy extends Entity implements BossEntity {
  public name = 'FOXY';
  public subtitle = 'EL ZORRO PIRATA VELOZ';
  public health: number;
  public maxHealth: number;
  public isEnraged = false;
  public themeColor = '#f97316'; // Naranja fuego / carmesí
  public level: number;

  private actionTimer = 0;
  private sprintTimer = 0;
  private isSprinting = false;
  private sprintDirection = -1;
  private walkSpeed = 120;
  private cooldownMultiplier = 1;

  constructor(x: number, y: number, level: number = 1, customName?: string, customSubtitle?: string) {
    super(x, y, 52, 66);
    this.level = Math.max(1, Math.min(20, level));
    const factor = (this.level - 1) / 19;

    this.maxHealth = Math.round(42 + (this.level - 1) * 6.2); // 42 a 160 HP
    this.health = this.maxHealth;
    this.cooldownMultiplier = Math.max(0.45, 1 - factor * 0.48);

    this.vx = -this.walkSpeed;
    this.facingRight = false;

    if (customName) this.name = customName;
    if (customSubtitle) {
      this.subtitle = customSubtitle;
    } else if (this.level >= 15) {
      this.subtitle = 'SPRINT DESTRUCCIÓN SUPERSÓNICO';
    } else if (this.level >= 10) {
      this.subtitle = 'TERROR DEL PIRATE COVE';
    } else if (this.level >= 5) {
      this.subtitle = 'GARFIO DE TITANIO BLINDADO';
    }
  }

  public update(dt: number, levelPlatforms: Rect[]): void {
    this.actionTimer += dt;
    this.sprintTimer += dt;
    this.vy += 720 * dt;

    if (this.health <= this.maxHealth * 0.5 && !this.isEnraged) {
      this.isEnraged = true;
      this.subtitle = '¡VELOCIDAD EXTREMA! ZARPAZO MORTAL';
      this.themeColor = '#ff2200';
      this.walkSpeed = 165;
    }

    // Pirate Cove Sprint a hipervelocidad
    const sprintCooldown = (this.isEnraged ? 2.2 : 3.5) * this.cooldownMultiplier;
    if (this.sprintTimer > sprintCooldown && !this.isSprinting) {
      this.sprintTimer = 0;
      this.isSprinting = true;
      SoundSystem.getInstance().playShoot('LASER');
    }

    if (this.isSprinting) {
      const sprintSpeed = (this.isEnraged ? 320 : 260);
      this.x += this.sprintDirection * sprintSpeed * dt;
      if (this.x < 1780) {
        this.sprintDirection = 1;
        this.facingRight = true;
      } else if (this.x > 2140) {
        this.sprintDirection = -1;
        this.facingRight = false;
        this.isSprinting = false; // Termina el sprint
      }
    } else {
      this.x += this.vx * dt;
      if (this.x < 1810) {
        this.vx = this.walkSpeed;
        this.facingRight = true;
      } else if (this.x > 2130) {
        this.vx = -this.walkSpeed;
        this.facingRight = false;
      }
    }

    const prevY = this.y;
    this.y += this.vy * dt;
    this.isGrounded = false;

    for (const plat of levelPlatforms) {
      if (this.vy >= 0 && prevY + this.height <= plat.y + 8 && Entity.checkCollision(this.getBounds(), plat)) {
        this.y = plat.y - this.height;
        this.vy = 0;
        this.isGrounded = true;
        break;
      }
    }
  }

  public attack(playerX: number, playerY: number): Bullet[] {
    const bullets: Bullet[] = [];
    const baseCooldown = this.isEnraged ? 1.4 : 2.2;
    const cooldown = baseCooldown * this.cooldownMultiplier;

    if (this.actionTimer >= cooldown) {
      this.actionTimer = 0;

      const dirX = playerX < this.x ? -1 : 1;
      this.facingRight = dirX > 0;
      this.sprintDirection = dirX;

      // Cañonazo de asedio pirata pesado
      SoundSystem.getInstance().playExplosion();
      bullets.push(
        new Bullet({
          x: this.facingRight ? this.x + this.width + 4 : this.x - 4,
          y: this.y + 26,
          vx: dirX * (this.isEnraged ? 300 : 240),
          vy: -15,
          radius: 8,
          damage: 1,
          isEnemy: true,
          color: '#ea580c',
          type: 'FOXY_CANNON_BALL',
        })
      );
    }

    return bullets;
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    const sx = Math.floor(this.x - cameraX);
    const sy = Math.floor(this.y - cameraY);

    ctx.save();
    ctx.translate(sx + this.width / 2, sy + this.height);
    if (!this.facingRight) ctx.scale(-1, 1);

    // Pantalón pirata marrón desgarrado y pata biónica cromada
    const run = Math.sin(Date.now() / 60) * (this.isSprinting ? 8 : 4);
    ctx.fillStyle = '#78350f'; // Pantalón
    ctx.fillRect(-14 + run, -16, 9, 10);
    ctx.fillRect(4 - run, -16, 9, 10);

    // Pata de palo / biónica plateada
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-12 + run, -6, 5, 6);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(6 - run, -6, 6, 6);

    // Pecho carmesí desgarrado con costillas de endoesqueleto de titanio
    ctx.fillStyle = '#c2410c'; // Pelaje zorro
    ctx.fillRect(-17, -42, 34, 26);

    // Costillas metálicas expuestas
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-8, -36, 16, 3);
    ctx.fillRect(-6, -30, 12, 3);
    ctx.fillRect(-4, -24, 8, 3);

    // Brazo derecho: Garfio afilado de combate
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(-22, -42, 8, 18);
    // Garfio de titanio
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.arc(-22, -22, 6, 0, Math.PI * 1.5);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f1f5f9';
    ctx.stroke();

    // Brazo izquierdo: Cañón de asedio integrado
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(14, -42, 10, 16);
    ctx.fillStyle = '#1e293b'; // Cañón pirata
    ctx.fillRect(18, -32, 16, 12);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(32, -33, 4, 14);

    // Cabeza y hocico de zorro afilado
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(-14, -58, 28, 18);

    // Hocico y mandíbula con colmillos
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(2, -50, 18, 8);
    ctx.fillStyle = '#0f172a'; // Nariz negra
    ctx.fillRect(18, -51, 3, 3);

    // Colmillos afilados de acero
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, -46, 2, 3);
    ctx.fillRect(12, -46, 2, 3);

    // Parche pirata en ojo derecho
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-10, -56, 7, 7);
    ctx.fillRect(-14, -57, 18, 1); // Tira del parche

    // Ojo izquierdo amarillo brillante / rojo enfurecido
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(2, -56, 7, 7);
    ctx.fillStyle = this.isEnraged ? '#ff0033' : '#facc15';
    ctx.fillRect(4, -55, 4, 4);

    // Orejas de zorro rasgadas
    ctx.fillStyle = '#c2410c';
    ctx.beginPath();
    ctx.moveTo(-14, -58);
    ctx.lineTo(-8, -72);
    ctx.lineTo(-2, -58);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(2, -58);
    ctx.lineTo(8, -72);
    ctx.lineTo(14, -58);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

