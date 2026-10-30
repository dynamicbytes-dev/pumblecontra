/**
 * WeaponSystem - Lógica de disparo y armas paródicas (Machine Gun, Spread, Laser, Banana, Pea)
 */

import { Bullet } from './entities/Bullet';
import { SoundSystem } from '../core/Audio';

export type WeaponType = 'MACHINEGUN' | 'SPREAD' | 'LASER' | 'BANANA' | 'PEA';

export interface WeaponDefinition {
  name: string;
  code: string;
  cooldown: number; // Segundos entre disparos
  damage: number;
  speed: number;
  color: string;
  description: string;
}

export const WEAPONS: Record<WeaponType, WeaponDefinition> = {
  MACHINEGUN: {
    name: 'Heavy Machine Gun',
    code: 'M',
    cooldown: 0.08, // Ráfaga continua súper rápida estilo Rambo
    damage: 1.2,
    speed: 520,
    color: '#ffaa00',
    description: 'Metralleta pesada estilo Rambo con ráfagas continuas y casquillos dorados',
  },
  SPREAD: {
    name: 'Sausage Spread',
    code: 'S',
    cooldown: 0.26,
    damage: 1.5,
    speed: 350,
    color: '#ff3344',
    description: 'El mítico abanico séxtuple de salchichas incandescentes',
  },
  LASER: {
    name: 'Laser Baguette',
    code: 'L',
    cooldown: 0.11,
    damage: 2.2,
    speed: 500,
    color: '#00ffff',
    description: 'Haz hiperbólico de masa crujiente',
  },
  BANANA: {
    name: 'Banana Boomerang',
    code: 'B',
    cooldown: 0.35,
    damage: 3.5,
    speed: 290,
    color: '#ffe600',
    description: 'Proyectil acrobático de alto impacto',
  },
  PEA: {
    name: 'Pea Shooter',
    code: 'P',
    cooldown: 0.16,
    damage: 1,
    speed: 380,
    color: '#ffdd00',
    description: 'Guisantes tácticos de fuego rápido',
  },
};

export class WeaponManager {
  private currentWeapon: WeaponType = 'MACHINEGUN'; // Por defecto la Heavy Machine Gun
  private fireTimer = 0;

  public getWeapon(): WeaponType {
    return this.currentWeapon;
  }

  public getWeaponInfo(): WeaponDefinition {
    return WEAPONS[this.currentWeapon];
  }

  public setWeapon(type: WeaponType): void {
    this.currentWeapon = type;
    SoundSystem.getInstance().playPowerup();
  }

  public update(dt: number): void {
    if (this.fireTimer > 0) {
      this.fireTimer -= dt;
    }
  }

  public canFire(): boolean {
    return this.fireTimer <= 0;
  }

  public fire(
    originX: number,
    originY: number,
    dirX: number,
    dirY: number
  ): Bullet[] {
    if (!this.canFire()) return [];

    const def = WEAPONS[this.currentWeapon];
    this.fireTimer = def.cooldown;
    const bullets: Bullet[] = [];

    // Normalizar dirección
    const length = Math.hypot(dirX, dirY) || 1;
    const nx = dirX / length;
    const ny = dirY / length;

    SoundSystem.getInstance().playShoot(this.currentWeapon);

    if (this.currentWeapon === 'MACHINEGUN') {
      // Disparo de metralleta pesada con ligero esparcimiento realista (spread de 0.04 rad)
      const spreadAngle = (Math.random() * 2 - 1) * 0.04;
      const baseAngle = Math.atan2(ny, nx) + spreadAngle;

      bullets.push(
        new Bullet({
          x: originX,
          y: originY,
          vx: Math.cos(baseAngle) * def.speed,
          vy: Math.sin(baseAngle) * def.speed,
          radius: 3,
          damage: def.damage,
          isEnemy: false,
          color: def.color,
          type: 'MACHINEGUN',
        })
      );
    } else if (this.currentWeapon === 'SPREAD') {
      // Abanico clásico de 5 proyectiles con diferentes ángulos
      const angles = [-0.28, -0.14, 0, 0.14, 0.28];
      const baseAngle = Math.atan2(ny, nx);

      for (const offset of angles) {
        const finalAngle = baseAngle + offset;
        bullets.push(
          new Bullet({
            x: originX,
            y: originY,
            vx: Math.cos(finalAngle) * def.speed,
            vy: Math.sin(finalAngle) * def.speed,
            radius: 4,
            damage: def.damage,
            isEnemy: false,
            color: def.color,
            type: 'SPREAD',
          })
        );
      }
    } else if (this.currentWeapon === 'LASER') {
      bullets.push(
        new Bullet({
          x: originX,
          y: originY,
          vx: nx * def.speed,
          vy: ny * def.speed,
          radius: 4,
          damage: def.damage,
          isEnemy: false,
          color: def.color,
          type: 'LASER',
        })
      );
    } else if (this.currentWeapon === 'BANANA') {
      bullets.push(
        new Bullet({
          x: originX,
          y: originY,
          vx: nx * def.speed,
          vy: (ny * def.speed) - 60,
          radius: 5,
          damage: def.damage,
          isEnemy: false,
          color: def.color,
          type: 'BANANA',
        })
      );
    } else {
      // PEA Normal
      bullets.push(
        new Bullet({
          x: originX,
          y: originY,
          vx: nx * def.speed,
          vy: ny * def.speed,
          radius: 3,
          damage: def.damage,
          isEnemy: false,
          color: def.color,
          type: 'PEA',
        })
      );
    }

    return bullets;
  }
}
