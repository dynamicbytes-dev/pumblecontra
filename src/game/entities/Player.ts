/**
 * Player - Fontanero paródico e hipermusculoso ("Super Plumber Rambo")
 * Estética pixel art retro 16-bits, movimiento en 8 direcciones, salto arcade
 * y metralleta pesada con retroceso visual y casquillos de bala dorados.
 */

import { Entity, Rect } from './Entity';
import { InputManager } from '../../core/Input';
import { WeaponManager } from '../WeaponSystem';
import { Bullet } from './Bullet';
import { SoundSystem } from '../../core/Audio';
import { ParticleSystem } from '../ParticleSystem';

export class Player extends Entity {
  public lives = 3;
  public score = 0;
  public invulnerableTimer = 0;
  public isInvulnerable = false;

  // Estados de apuntado y postura
  public isCrouching = false;
  public isAimingUp = false;
  public isAimingDown = false;
  public isJumping = false;
  private somersaultAngle = 0;

  // Retroceso visual de la metralleta
  public recoilOffset = 0;
  private muzzleFlashTimer = 0;
  private shootAngle = 0;

  // Gestión de armas
  public weaponManager = new WeaponManager();

  // Físicas arcade de salto y velocidad
  private speed = 155;        // Movimiento horizontal ágil
  private jumpForce = -350;    // Salto rápido arcade responsivo
  private gravity = 820;       // Gravedad firme arcade

  constructor(x: number, y: number) {
    super(x, y, 20, 32); // Dimensiones robustas de 16-bits
  }

  public reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.isGrounded = false;
    this.isCrouching = false;
    this.isJumping = false;
    this.somersaultAngle = 0;
    this.recoilOffset = 0;
    this.muzzleFlashTimer = 0;
    this.invulnerableTimer = 2.0; // 2s de gracia al reaparecer
    this.isInvulnerable = true;
    this.alive = true;
  }

  public takeDamage(): boolean {
    if (this.isInvulnerable || !this.alive) return false;

    this.lives--;
    SoundSystem.getInstance().playPlayerHit();
    this.invulnerableTimer = 2.5;
    this.isInvulnerable = true;

    if (this.lives <= 0) {
      this.alive = false;
      SoundSystem.getInstance().playGameOver();
    }
    return true;
  }

  public update(dt: number, levelPlatforms: Rect[]): void {
    if (!this.alive) return;

    const input = InputManager.getInstance();
    const inputState = input.getState();

    // Actualizar arma
    this.weaponManager.update(dt);

    // Amortiguar retroceso de metralleta
    if (this.recoilOffset > 0) {
      this.recoilOffset = Math.max(0, this.recoilOffset - dt * 25);
    }
    if (this.muzzleFlashTimer > 0) {
      this.muzzleFlashTimer -= dt;
    }

    // Temporizador de invulnerabilidad
    if (this.isInvulnerable) {
      this.invulnerableTimer -= dt;
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
      }
    }

    // Detectar dirección de apuntado (8 direcciones)
    this.isAimingUp = inputState.up;
    this.isAimingDown = inputState.down;

    // Agacharse (en el suelo sin moverse a los lados)
    if (this.isGrounded && inputState.down && !inputState.left && !inputState.right) {
      this.isCrouching = true;
      this.height = 18;
      this.vx = 0;
    } else {
      this.isCrouching = false;
      this.height = 32;
    }

    // Movimiento horizontal si no está agachado
    if (!this.isCrouching) {
      if (inputState.left) {
        this.vx = -this.speed;
        this.facingRight = false;
      } else if (inputState.right) {
        this.vx = this.speed;
        this.facingRight = true;
      } else {
        this.vx = 0;
      }
    }

    // Salto rápido estilo arcade
    if (input.isJumpJustPressed() && this.isGrounded && !this.isCrouching) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
      this.isJumping = true;
      this.somersaultAngle = 0;
      SoundSystem.getInstance().playJump();
    }

    // Corte de salto responsive (si suelta el botón de salto antes, cae suavemente)
    if (!inputState.jump && this.vy < -120) {
      this.vy = -120;
    }

    // Aplicar gravedad
    this.vy += this.gravity * dt;
    if (this.vy > 420) this.vy = 420; // Velocidad terminal

    // Movimiento horizontal y límites
    this.x += this.vx * dt;
    if (this.x < 10) this.x = 10;

    // Movimiento vertical y detección de suelo
    const prevY = this.y;
    this.y += this.vy * dt;
    this.isGrounded = false;

    // Colisión de plataformas de un solo sentido (one-way platforms)
    for (const plat of levelPlatforms) {
      const pRect = this.getBounds();
      if (
        this.vy >= 0 &&
        prevY + pRect.height <= plat.y + 7 &&
        Entity.checkCollision(pRect, plat)
      ) {
        this.y = plat.y - pRect.height;
        this.vy = 0;
        this.isGrounded = true;
        this.isJumping = false;
        this.somersaultAngle = 0;
        break;
      }
    }

    // Animación de somersault giratorio mientras salta
    if (this.isJumping || !this.isGrounded) {
      const rotDir = this.facingRight ? 1 : -1;
      this.somersaultAngle += rotDir * dt * 14;
    }
  }

  /**
   * Manejo de disparo en 8 direcciones con expulsión de casquillos dorados y retroceso visual
   */
  public handleShooting(particles: ParticleSystem, onRecoil?: (intensity: number) => void): Bullet[] {
    if (!this.alive) return [];

    const input = InputManager.getInstance();
    const inputState = input.getState();

    if (!inputState.fire) return [];

    // Determinar vector director (dirX, dirY) en 8 direcciones
    let dirX = this.facingRight ? 1 : -1;
    let dirY = 0;

    if (this.isAimingUp) {
      if (inputState.left || inputState.right) {
        dirX = this.facingRight ? 1 : -1;
        dirY = -1; // 1. Diagonal arriba
      } else {
        dirX = 0;
        dirY = -1; // 2. Vertical puro arriba
      }
    } else if (this.isAimingDown && !this.isGrounded) {
      if (inputState.left || inputState.right) {
        dirX = this.facingRight ? 1 : -1;
        dirY = 1;  // 3. Diagonal abajo en el aire
      } else {
        dirX = 0;
        dirY = 1;  // 4. Vertical hacia abajo en el aire
      }
    } else if (this.isCrouching) {
      dirX = this.facingRight ? 1 : -1;
      dirY = 0;    // 5. Agachado a ras de suelo
    } else {
      dirX = this.facingRight ? 1 : -1;
      dirY = 0;    // 6. Horizontal adelante
    }

    // Posición exacta de la boca del cañón (Muzzle)
    let muzzleX = this.facingRight ? this.x + this.width + 10 : this.x - 10;
    let muzzleY = this.y + 12;

    if (this.isCrouching) {
      muzzleY = this.y + 9;
      muzzleX = this.facingRight ? this.x + this.width + 12 : this.x - 12;
    } else if (dirY < 0 && dirX === 0) {
      // Disparando recto hacia arriba
      muzzleX = this.x + this.width / 2;
      muzzleY = this.y - 12;
    } else if (dirY < 0) {
      // Diagonal arriba
      muzzleX = this.facingRight ? this.x + this.width + 6 : this.x - 6;
      muzzleY = this.y;
    } else if (dirY > 0 && dirX === 0) {
      // Hacia abajo en el aire
      muzzleX = this.x + this.width / 2;
      muzzleY = this.y + this.height + 4;
    }

    // Disparar proyectil
    const bullets = this.weaponManager.fire(muzzleX, muzzleY, dirX, dirY);

    if (bullets.length > 0) {
      // Retroceso visual de la metralleta y screen shake
      this.recoilOffset = 4.5;
      this.muzzleFlashTimer = 0.06;
      this.shootAngle = Math.atan2(dirY, dirX);

      // 1. Expulsar casquillo de bala dorado volando hacia atrás
      const chamberX = this.facingRight ? this.x + 8 : this.x + this.width - 8;
      const chamberY = this.y + 12;
      particles.createBulletShell(chamberX, chamberY, this.facingRight);

      // 2. Fogonazo animado en la boca del cañón
      particles.createMuzzleFlash(muzzleX, muzzleY, this.shootAngle);

      // 3. Screen shake leve para metralleta pesada
      onRecoil?.(1.4);
    }

    return bullets;
  }

  /**
   * Renderizado Pixel Art 16-bits del Fontanero Hipermusculoso
   */
  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    if (!this.alive) return;

    // Parpadeo de invulnerabilidad
    if (this.isInvulnerable && Math.floor(Date.now() / 65) % 2 === 0) {
      return;
    }

    const sx = Math.floor(this.x - cameraX);
    const sy = Math.floor(this.y - cameraY);

    ctx.save();

    // 1. SOMERSAULT ACROBÁTICO EN EL SALTO
    if (this.isJumping || (!this.isGrounded && Math.abs(this.vy) > 110)) {
      ctx.translate(sx + this.width / 2, sy + this.height / 2);
      ctx.rotate(this.somersaultAngle);

      // Bola de salto acrobático estilo Contra
      // Peto azul
      ctx.fillStyle = '#0b3c94';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      // Músculos y torso
      ctx.fillStyle = '#f0ad79';
      ctx.beginPath();
      ctx.arc(-2, -2, 7, 0, Math.PI * 2);
      ctx.fill();

      // Gorra roja de fontanero rodante
      ctx.fillStyle = '#e60012';
      ctx.fillRect(-10, -7, 18, 5);

      // Bigote prominente
      ctx.fillStyle = '#1a0d00';
      ctx.fillRect(-3, 0, 8, 4);

      // Metralleta girando con el cuerpo
      ctx.fillStyle = '#22252a';
      ctx.fillRect(-14, -3, 26, 6);

      ctx.restore();
      return;
    }

    // 2. POSE EN TIERRA O SALTO CONTROLADO
    ctx.translate(sx + this.width / 2, sy + this.height);
    if (!this.facingRight) {
      ctx.scale(-1, 1);
    }

    // Retroceso visual aplicado al arma
    const recoilX = -this.recoilOffset;

    if (this.isCrouching) {
      // --- FONTANERO AGACHADO A RAS DE SUELO ---
      // Botas de trabajo marrones
      ctx.fillStyle = '#4a2511';
      ctx.fillRect(-10, -5, 12, 5);
      ctx.fillRect(2, -5, 10, 5);

      // Pantalones de peto azul arrugados
      ctx.fillStyle = '#0b3c94';
      ctx.fillRect(-12, -10, 24, 7);

      // Pectorales hipertrofiados apoyados en la rodilla
      ctx.fillStyle = '#f0ad79';
      ctx.fillRect(-8, -16, 16, 7);
      ctx.fillStyle = '#bf6d37'; // Sombra muscular
      ctx.fillRect(-1, -16, 2, 7);

      // Cartuchera de balas cruzada
      ctx.fillStyle = '#ffd700';
      for (let bx = -6; bx <= 6; bx += 4) {
        ctx.fillRect(bx, -14, 2, 4);
      }

      // Cabeza y Bigote
      ctx.fillStyle = '#f0ad79';
      ctx.fillRect(-6, -23, 12, 8);
      ctx.fillStyle = '#1a0d00'; // Bigote gigante de fontanero rudo
      ctx.fillRect(0, -18, 10, 4);
      ctx.fillRect(2, -19, 6, 2);

      // Ojos furiosos de 16-bits
      ctx.fillStyle = '#000000';
      ctx.fillRect(2, -21, 2, 2);

      // Gorra roja de fontanero
      ctx.fillStyle = '#e60012';
      ctx.fillRect(-7, -26, 14, 5);
      ctx.fillRect(0, -24, 8, 3); // Visera
      // Emblema circular en la gorra
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-3, -25, 4, 3);
      ctx.fillStyle = '#e60012';
      ctx.fillRect(-2, -25, 2, 2);

      // Metralleta pesada apoyada en el suelo
      ctx.fillStyle = '#22252a';
      ctx.fillRect(4 + recoilX, -13, 24, 6);
      ctx.fillStyle = '#ffd700'; // Tambor de munición
      ctx.fillRect(8 + recoilX, -9, 8, 6);

      // Cañón perforado
      ctx.fillStyle = '#444952';
      ctx.fillRect(18 + recoilX, -12, 10, 4);
    } else {
      // --- FONTANERO DE PIE O CORRIENDO ---
      const walk = this.vx !== 0 ? Math.sin(Date.now() / 75) * 5 : 0;

      // 1. Botas pesadas de fontanero (16-bits)
      ctx.fillStyle = '#4a2511';
      ctx.fillRect(-7 + walk, -6, 7, 6);
      ctx.fillRect(2 - walk, -6, 7, 6);
      ctx.fillStyle = '#2b1407'; // Suela reforzada
      ctx.fillRect(-7 + walk, -2, 7, 2);
      ctx.fillRect(2 - walk, -2, 7, 2);

      // 2. Piernas y Peto Azul (con arrugas y costuras)
      ctx.fillStyle = '#0b3c94';
      ctx.fillRect(-7 + walk, -16, 6, 11);
      ctx.fillRect(2 - walk, -16, 6, 11);

      // Cintura y cadera con remaches de latón
      ctx.fillRect(-8, -18, 17, 4);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-6, -18, 2, 2);
      ctx.fillRect(5, -18, 2, 2);

      // 3. Torso Hipermusculoso (Pectorales colosales y abdominales de 16 bits)
      // Base de piel
      ctx.fillStyle = '#f0ad79';
      ctx.fillRect(-9, -29, 18, 12);
      // Sombras de abdominales en "tableta de chocolate"
      ctx.fillStyle = '#bf6d37';
      ctx.fillRect(-8, -24, 4, 3);
      ctx.fillRect(4, -24, 4, 3);
      ctx.fillRect(-8, -20, 4, 3);
      ctx.fillRect(4, -20, 4, 3);
      // Separación de pectorales
      ctx.fillRect(-1, -29, 2, 11);
      // Luces en los pectorales superiores
      ctx.fillStyle = '#ffd9b3';
      ctx.fillRect(-7, -29, 5, 2);
      ctx.fillRect(2, -29, 5, 2);

      // 4. Tirantes del mono azul desabrochados sobre los hombros
      ctx.fillStyle = '#0b3c94';
      ctx.fillRect(-9, -29, 3, 12);
      ctx.fillRect(7, -29, 3, 12);

      // 5. Canana / Cinta de balas doradas cruzada en diagonal (estilo Rambo)
      ctx.fillStyle = '#422409'; // Correa de cuero
      ctx.beginPath();
      ctx.moveTo(-8, -29);
      ctx.lineTo(8, -18);
      ctx.lineTo(6, -18);
      ctx.lineTo(-8, -27);
      ctx.fill();

      // Balas doradas en la canana
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-6, -28, 2, 3);
      ctx.fillRect(-2, -25, 2, 3);
      ctx.fillRect(2, -22, 2, 3);

      // 6. Cabeza, Cara y Rasgos de 16 bits
      ctx.fillStyle = '#f0ad79';
      ctx.fillRect(-6, -37, 12, 9);
      // Mandíbula cuadrada hiperviril
      ctx.fillStyle = '#bf6d37';
      ctx.fillRect(-6, -30, 12, 2);

      // Bigote prominente negro de fontanero
      ctx.fillStyle = '#1a0d00';
      ctx.fillRect(-2, -33, 10, 4);
      ctx.fillRect(0, -34, 7, 2);
      ctx.fillRect(-3, -32, 2, 2);

      // Ojos decididos de combate
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1, -36, 4, 3);
      ctx.fillStyle = '#000000';
      ctx.fillRect(2, -36, 2, 2);

      // Gorra roja de fontanero (con visera y emblema)
      ctx.fillStyle = '#e60012';
      ctx.fillRect(-8, -41, 16, 5); // Copa
      ctx.fillRect(0, -38, 9, 3);  // Visera proyectada
      // Emblema circular frontal
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-3, -40, 5, 4);
      ctx.fillStyle = '#e60012';
      ctx.fillRect(-2, -39, 3, 2);

      // 7. Brazos con Bíceps gigantes y Guantes Blancos
      // Bíceps
      ctx.fillStyle = '#f0ad79';
      ctx.fillRect(-12, -28, 5, 8);
      ctx.fillRect(6, -26, 6, 6);
      ctx.fillStyle = '#bf6d37';
      ctx.fillRect(-11, -24, 2, 4);

      // Guante blanco de fontanero empuñando la empuñadura
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6, -23, 6, 5);
      ctx.fillRect(-1, -22, 5, 4);

      // 8. METRALLETA PESADA ESTILO RAMBO Y APUNTADO EN 8 DIRECCIONES
      ctx.save();
      if (this.isAimingUp) {
        if (this.vx !== 0) {
          // DIAGONAL ARRIBA (45°)
          ctx.translate(6, -24);
          ctx.rotate(-Math.PI / 4);
          this.renderMachineGun(ctx, recoilX);
        } else {
          // VERTICAL ARRIBA (90°)
          ctx.translate(2, -32);
          ctx.rotate(-Math.PI / 2);
          this.renderMachineGun(ctx, recoilX);
        }
      } else if (this.isAimingDown && !this.isGrounded) {
        if (this.vx !== 0) {
          // DIAGONAL ABAJO EN EL AIRE
          ctx.translate(6, -18);
          ctx.rotate(Math.PI / 4);
          this.renderMachineGun(ctx, recoilX);
        } else {
          // VERTICAL ABAJO EN EL AIRE
          ctx.translate(2, -12);
          ctx.rotate(Math.PI / 2);
          this.renderMachineGun(ctx, recoilX);
        }
      } else {
        // HORIZONTAL ADELANTE
        ctx.translate(4, -22);
        this.renderMachineGun(ctx, recoilX);
      }
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Dibuja la ametralladora pesada de 16-bits con tambor de munición y cañón ventilado
   */
  private renderMachineGun(ctx: CanvasRenderingContext2D, recoilX: number): void {
    // Receptor principal de acero negro
    ctx.fillStyle = '#1c1f24';
    ctx.fillRect(recoilX, -4, 16, 8);

    // Cubierta superior metálica
    ctx.fillStyle = '#2d333b';
    ctx.fillRect(recoilX + 2, -5, 12, 2);

    // Tambor de munición dorado / verde militar
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(recoilX + 4, 3, 9, 8);
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(recoilX + 5, 4, 7, 2);

    // Cañón largo perforado (Minigun / M60)
    ctx.fillStyle = '#3a3f47';
    ctx.fillRect(recoilX + 16, -3, 14, 5);

    // Ranuras de ventilación del cañón
    ctx.fillStyle = '#111215';
    ctx.fillRect(recoilX + 18, -2, 2, 3);
    ctx.fillRect(recoilX + 22, -2, 2, 3);
    ctx.fillRect(recoilX + 26, -2, 2, 3);

    // Bocacha apagallamas del cañón
    ctx.fillStyle = '#555b66';
    ctx.fillRect(recoilX + 30, -4, 3, 7);
  }
}
