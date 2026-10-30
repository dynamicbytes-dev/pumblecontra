/**
 * Game - Controlador principal de la lógica, estados, colisiones y entidades
 * Sistema de 20 Niveles con progresión lineal y dinámica de dificultad,
 * transición automática ("STAGE CLEARED") y guardado local offline.
 */

import { Player } from './entities/Player';
import { Bullet } from './entities/Bullet';
import { Entity } from './entities/Entity';
import {
  ZombieMushroom,
  ArmoredLizard,
  FlyingCapsule,
  PowerUpItem,
  BossEntity,
  BossElChaval,
  BossDonRamfis,
  BossFreddyFazbear,
  BossBonnie,
  BossChica,
  BossFoxy,
} from './entities/Enemy';
import { Level } from './Level';
import { Camera } from '../core/Camera';
import { ParticleSystem } from './ParticleSystem';
import { HUD } from '../ui/HUD';
import { SoundSystem } from '../core/Audio';
import { InputManager } from '../core/Input';
import { ModalManager } from '../ui/Modal';
import { VirtualControls } from '../ui/VirtualControls';
import { WeaponType } from './WeaponSystem';
import { StorageManager } from '../core/Storage';

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'STAGE_CLEAR' | 'GAMEOVER' | 'VICTORY';

export class Game {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public state: GameState = 'MENU';

  // Sistema de 20 Niveles
  public currentLevel = 1;
  public readonly totalLevels = 20;

  public player: Player;
  public level: Level;
  public camera: Camera;
  public particles: ParticleSystem;
  public hud: HUD;
  public modals: ModalManager;
  public virtualControls: VirtualControls;

  // Colecciones de entidades
  public playerBullets: Bullet[] = [];
  public enemyBullets: Bullet[] = [];
  public enemies: (ZombieMushroom | ArmoredLizard)[] = [];
  public capsules: FlyingCapsule[] = [];
  public powerUps: PowerUpItem[] = [];

  // Jefes Paródicos
  public activeBoss: BossEntity | null = null;
  public midBossDefeated = false;
  public stageBossDefeated = false;

  private spawnTimer = 0;
  private capsuleTimer = 0;

  // Transición de Nivel ("STAGE CLEARED")
  private stageClearTimer = 0;
  private readonly stageClearDuration = 2.8;
  private stageBonusScore = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;

    this.ctx.imageSmoothingEnabled = false;

    this.currentLevel = 1;
    this.level = new Level(this.currentLevel);
    this.camera = new Camera(canvas.width, canvas.height);
    this.player = new Player(40, 180);
    this.particles = new ParticleSystem();
    this.hud = new HUD();
    this.modals = new ModalManager();
    this.virtualControls = new VirtualControls('virtual-controls');

    this.setupInitialSpawns();
  }

  private setupInitialSpawns(): void {
    const lvl = this.currentLevel;
    // Oleada inicial de hongos mutantes zombis y lagartos acorazados con escala de nivel
    this.enemies = [
      new ZombieMushroom(220, 160, lvl),
      new ZombieMushroom(380, 210, lvl),
      new ArmoredLizard(500, 210, lvl),
      new ZombieMushroom(720, 150, lvl),
      new ArmoredLizard(860, 210, lvl),
      new ZombieMushroom(1400, 120, lvl),
      new ArmoredLizard(1560, 160, lvl),
    ];

    // Cápsulas voladoras con armas temáticas
    this.capsules = [
      new FlyingCapsule(100, 80, 'SPREAD'),
      new FlyingCapsule(680, 70, 'MACHINEGUN'),
      new FlyingCapsule(1350, 85, 'BANANA'),
    ];
  }

  public startNewGame(startLevel: number = 1): void {
    this.currentLevel = Math.max(1, Math.min(this.totalLevels, startLevel));
    this.player.reset(40, 180);
    this.player.lives = 3;
    this.player.score = 0;
    this.player.weaponManager.setWeapon('MACHINEGUN');

    this.loadLevel(this.currentLevel, false);

    this.virtualControls.setVisible(true);
    SoundSystem.getInstance().init();
    SoundSystem.getInstance().startMusic();
  }

  public loadLevel(levelNumber: number, preservePlayer: boolean): void {
    this.currentLevel = Math.max(1, Math.min(this.totalLevels, levelNumber));
    this.state = 'PLAYING';

    // Actualizar almacenamiento offline del nivel máximo alcanzado
    StorageManager.getInstance().saveMaxLevel(this.currentLevel);

    // Configurar nivel y nuevo bioma/paleta
    this.level.setLevel(this.currentLevel);
    this.camera.reset();
    this.particles.clear();
    this.playerBullets = [];
    this.enemyBullets = [];
    this.powerUps = [];
    this.activeBoss = null;
    this.midBossDefeated = false;
    this.stageBossDefeated = false;
    this.spawnTimer = 0;
    this.capsuleTimer = 0;

    if (preservePlayer) {
      // Recompensa: restaurar o sumar vida si tiene menos de 3
      if (this.player.lives < 3) {
        this.player.lives++;
      }
      this.player.reset(40, 180);
    } else {
      this.player.reset(40, 180);
    }

    this.setupInitialSpawns();

    // Mensaje flotante de inicio de nivel
    this.particles.createFloatingText(
      120,
      120,
      `¡${this.level.theme.name}!`,
      '#00f0ff'
    );
  }

  public pauseGame(): void {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    this.modals.showPause(
      () => {
        this.state = 'PLAYING';
      },
      () => {
        this.goToMenu();
      }
    );
  }

  public goToMenu(): void {
    this.state = 'MENU';
    SoundSystem.getInstance().stopMusic();
    this.virtualControls.setVisible(false);
  }

  public handleGameOver(): void {
    this.state = 'GAMEOVER';
    SoundSystem.getInstance().stopMusic();

    // Guardar puntuación y nivel alcanzado offline
    StorageManager.getInstance().saveMaxLevel(this.currentLevel);

    this.modals.showGameOver(
      this.player.score,
      this.currentLevel,
      this.player.weaponManager.getWeapon(),
      () => {
        this.startNewGame(1);
      },
      () => {
        this.goToMenu();
      }
    );
  }

  public handleVictory(): void {
    this.state = 'VICTORY';
    SoundSystem.getInstance().stopMusic();
    SoundSystem.getInstance().playFinalVictory();

    // Guardar nivel 20 como completado
    StorageManager.getInstance().saveMaxLevel(20);

    this.modals.showVictory(
      this.player.score,
      this.player.weaponManager.getWeapon(),
      () => {
        this.startNewGame(1);
      },
      () => {
        this.goToMenu();
      }
    );
  }

  private triggerStageClear(): void {
    const bonus = 2000 + this.currentLevel * 1000;
    this.stageBonusScore = bonus;
    this.player.score += bonus;

    // Registrar progreso en localStorage inmediatamente
    StorageManager.getInstance().saveMaxLevel(Math.min(20, this.currentLevel + 1));

    if (this.currentLevel >= this.totalLevels) {
      // Si superó el nivel 20, se completa el juego completo
      this.handleVictory();
      return;
    }

    this.state = 'STAGE_CLEAR';
    this.stageClearTimer = this.stageClearDuration;

    // Sonido de victoria de fase y explosión de confeti
    SoundSystem.getInstance().playStageClear();
    this.camera.addShake(10);

    // Erupción de partículas festivas
    for (let k = 0; k < 12; k++) {
      const px = this.player.x + (Math.random() * 80 - 40);
      const py = this.player.y + (Math.random() * 60 - 30);
      this.particles.createExplosion(px, py, 'CLEARED!');
    }
  }

  public advanceToNextLevel(): void {
    if (this.state !== 'STAGE_CLEAR') return;
    this.loadLevel(this.currentLevel + 1, true);
  }

  public update(dt: number): void {
    // Manejo de la pantalla de transición rápida STAGE CLEARED
    if (this.state === 'STAGE_CLEAR') {
      this.stageClearTimer -= dt;
      this.particles.update(dt);

      const input = InputManager.getInstance();
      if (input.isJumpJustPressed() || input.isFireJustPressed() || this.stageClearTimer <= 0) {
        this.advanceToNextLevel();
      }
      return;
    }

    if (this.state !== 'PLAYING') return;

    const input = InputManager.getInstance();
    if (input.isPauseJustPressed()) {
      this.pauseGame();
      return;
    }

    // 1. Actualizar Jugador
    this.player.update(dt, this.level.platforms);

    // Muerte por caer al foso
    if (this.player.y > this.level.height + 40) {
      this.player.takeDamage();
      if (this.player.alive) {
        this.player.reset(Math.max(40, this.player.x - 80), 100);
      }
    }

    if (!this.player.alive) {
      this.handleGameOver();
      return;
    }

    // Disparos del Jugador
    const newBullets = this.player.handleShooting(this.particles, (recoilShake) => {
      this.camera.addShake(recoilShake);
    });
    if (newBullets.length > 0) {
      this.playerBullets.push(...newBullets);
    }

    // 2. Actualizar Cámara
    this.camera.follow(this.player.x, this.player.y, this.level.width, dt);

    // 3. Spawns continuos dinámicos según nivel (más frecuentes y agresivos)
    this.spawnTimer += dt;
    const spawnInterval = Math.max(1.4, 3.2 - (this.currentLevel - 1) * 0.09);
    if (this.spawnTimer > spawnInterval && this.player.x < 1700) {
      this.spawnTimer = 0;
      const spawnX = this.camera.x + this.canvas.width + 30;
      if (Math.random() > 0.45) {
        this.enemies.push(new ZombieMushroom(spawnX, 150, this.currentLevel));
      } else {
        this.enemies.push(new ArmoredLizard(spawnX, 180, this.currentLevel));
      }
    }

    // Cápsulas aéreas periódicas de armamento
    this.capsuleTimer += dt;
    if (this.capsuleTimer > 10.0 && this.player.x < 1700) {
      this.capsuleTimer = 0;
      const weapons: WeaponType[] = ['SPREAD', 'LASER', 'BANANA', 'MACHINEGUN'];
      const chosen = weapons[Math.floor(Math.random() * weapons.length)];
      this.capsules.push(new FlyingCapsule(this.camera.x - 30, 80, chosen));
    }

    // 4. GESTIÓN DE JEFES DE NIVEL HIPERMUSCULOSOS A LO LARGO DE LOS 20 NIVELES
    const lvl = this.currentLevel;
    const isMilestone = lvl % 5 === 0; // Niveles 5, 10, 15, 20 tienen doble encuentro (mini-boss + boss)

    // MINI-JEFE INTERMEDIO (En niveles hito: X >= 950)
    if (isMilestone && this.player.x >= 950 && !this.midBossDefeated && !this.activeBoss) {
      this.activeBoss = this.createBossForLevel(lvl, true);
      this.particles.createFloatingText(1250, 100, `⚠️ ¡MINI-BOSS: ${this.activeBoss.name}! ⚠️`, this.activeBoss.themeColor);
      this.camera.addShake(8);
      SoundSystem.getInstance().playExplosion();
    }

    // JEFE DE ARENA PRINCIPAL (Al final del nivel: X >= 1750)
    const canSpawnStageBoss = !isMilestone || this.midBossDefeated;
    if (this.player.x >= 1750 && canSpawnStageBoss && !this.stageBossDefeated && !this.activeBoss) {
      this.activeBoss = this.createBossForLevel(lvl, false);
      this.particles.createFloatingText(2050, 90, `⚠️ ¡STAGE BOSS: ${this.activeBoss.name}! ⚠️`, this.activeBoss.themeColor);
      this.camera.addShake(10);
      SoundSystem.getInstance().playExplosion();
    }

    // 5. Actualizar Proyectiles del Jugador
    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const b = this.playerBullets[i];
      b.update(dt);
      if (!b.alive || b.x < this.camera.x - 50 || b.x > this.camera.x + this.canvas.width + 50) {
        this.playerBullets.splice(i, 1);
        continue;
      }

      let hit = false;

      // Colisión con enemigos comunes
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (
          b.x >= enemy.x &&
          b.x <= enemy.x + enemy.width &&
          b.y >= enemy.y &&
          b.y <= enemy.y + enemy.height
        ) {
          hit = true;
          enemy.health -= b.damage;

          this.particles.createFloatingText(b.x, b.y - 6, `-${Math.round(b.damage)}`, '#fffa00');
          this.camera.addShake(1.2);

          if (enemy.health <= 0) {
            this.enemies.splice(j, 1);
            this.player.score += enemy instanceof ArmoredLizard ? 250 : 150;
            const deathWord = enemy instanceof ZombieMushroom ? 'SPLAT!' : 'CRACK!';
            this.particles.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, deathWord);
            SoundSystem.getInstance().playExplosion();
            this.camera.addShake(2.5);
          }
          break;
        }
      }

      // Colisión con cápsulas voladoras
      if (!hit) {
        for (let k = this.capsules.length - 1; k >= 0; k--) {
          const cap = this.capsules[k];
          if (
            b.x >= cap.x &&
            b.x <= cap.x + cap.width &&
            b.y >= cap.y &&
            b.y <= cap.y + cap.height
          ) {
            hit = true;
            this.capsules.splice(k, 1);
            this.powerUps.push(new PowerUpItem(cap.x, cap.y, cap.weaponDrop));
            this.particles.createExplosion(cap.x + 10, cap.y + 7, 'DROP!');
            SoundSystem.getInstance().playExplosion();
            break;
          }
        }
      }

      // Colisión con el Jefe Activo
      if (!hit && this.activeBoss && this.activeBoss.alive) {
        const boss = this.activeBoss;
        if (
          b.x >= boss.x &&
          b.x <= boss.x + boss.width &&
          b.y >= boss.y &&
          b.y <= boss.y + boss.height
        ) {
          hit = true;
          boss.health -= b.damage;
          this.particles.createFloatingText(b.x, b.y, `-${Math.round(b.damage)}`, '#ff0055');
          this.camera.addShake(1.6);

          // Derrota del jefe
          if (boss.health <= 0) {
            boss.alive = false;
            this.player.score += 3500 + this.currentLevel * 500;
            let defeatQuote = '¡ENEMIGO DERROTADO!';
            if (boss instanceof BossElChaval) {
              defeatQuote = '¡SE ME CHISPOTEÓ!';
            } else if (boss instanceof BossDonRamfis) {
              defeatQuote = '¡NO TE DOY OTRA NO MÁS PORQUE...! ';
            } else if (boss instanceof BossFreddyFazbear) {
              defeatQuote = '¡TOREADOR MARCH SILENCIADA!';
            } else if (boss instanceof BossBonnie) {
              defeatQuote = '¡ROCK N ROLL APAGADO!';
            } else if (boss instanceof BossChica) {
              defeatQuote = '¡PIZZA OVERCOOKED!';
            } else if (boss instanceof BossFoxy) {
              defeatQuote = '¡EL PIRATA HA SIDO DETENIDO!';
            }
            this.particles.createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, defeatQuote);
            SoundSystem.getInstance().playExplosion();
            this.camera.addShake(12);

            // Si es mini-jefe intermedio en niveles hito
            if (isMilestone && !this.midBossDefeated) {
              this.midBossDefeated = true;
              this.powerUps.push(new PowerUpItem(boss.x + 20, boss.y + 10, 'SPREAD'));
              this.activeBoss = null;
            } else {
              // Derrota del JEFE DE NIVEL -> TRANSICIÓN AUTOMÁTICA
              this.stageBossDefeated = true;
              this.activeBoss = null;
              this.triggerStageClear();
            }
          }
        }
      }

      if (hit) {
        this.playerBullets.splice(i, 1);
      }
    }

    // 6. Actualizar Proyectiles Enemigos
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const eb = this.enemyBullets[i];
      eb.update(dt);
      if (!eb.alive || eb.x < this.camera.x - 80 || eb.x > this.camera.x + this.canvas.width + 80) {
        this.enemyBullets.splice(i, 1);
        continue;
      }

      const pRect = this.player.getBounds();
      if (
        eb.x >= pRect.x &&
        eb.x <= pRect.x + pRect.width &&
        eb.y >= pRect.y &&
        eb.y <= pRect.y + pRect.height
      ) {
        this.enemyBullets.splice(i, 1);
        if (this.player.takeDamage()) {
          this.particles.createExplosion(this.player.x + 10, this.player.y + 16, 'OUCH!');
          this.camera.addShake(7);
        }
      }
    }

    // 7. Actualizar Cápsulas y Recolección de Power-Ups
    this.capsules.forEach((c) => c.update(dt));
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const pu = this.powerUps[i];
      pu.update(dt, this.level.platforms);

      if (Entity.checkCollision(this.player.getBounds(), pu.getBounds())) {
        this.player.weaponManager.setWeapon(pu.weaponType);
        this.player.score += 250;
        this.particles.createFloatingText(
          this.player.x,
          this.player.y - 14,
          `WEAPON [${pu.weaponType[0]}]!`,
          '#fffa00'
        );
        this.powerUps.splice(i, 1);
      }
    }

    // 8. Actualizar Enemigos Comunes y Disparos
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const en = this.enemies[i];
      en.update(dt, this.level.platforms);

      if (en instanceof ZombieMushroom) {
        const spore = en.tryShootSpore(this.player.x);
        if (spore) this.enemyBullets.push(spore);
      } else if (en instanceof ArmoredLizard) {
        const spike = en.tryShootSpike(this.player.x);
        if (spike) this.enemyBullets.push(spike);
      }

      if (Entity.checkCollision(this.player.getBounds(), en.getBounds())) {
        if (this.player.takeDamage()) {
          this.particles.createExplosion(this.player.x + 10, this.player.y + 16, 'BONK!');
          this.camera.addShake(6);
        }
      }

      if (en.x < this.camera.x - 120) {
        this.enemies.splice(i, 1);
      }
    }

    // 9. Actualizar Jefe Activo
    if (this.activeBoss && this.activeBoss.alive) {
      this.activeBoss.update(dt, this.level.platforms);

      const bossShots = this.activeBoss.attack(
        this.player.x,
        this.player.y
      );
      if (bossShots && bossShots.length > 0) {
        this.enemyBullets.push(...bossShots);
      }

      if (Entity.checkCollision(this.player.getBounds(), this.activeBoss.getBounds())) {
        if (this.player.takeDamage()) {
          this.particles.createExplosion(this.player.x + 10, this.player.y + 16, 'CRUSH!');
          this.camera.addShake(8);
        }
      }
    }

    // 10. Actualizar Partículas
    this.particles.update(dt);
  }

  public render(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const camX = this.camera.x + this.camera.offsetX;
    const camY = this.camera.y + this.camera.offsetY;

    // 1. Fondo Parallax del Nivel
    this.level.renderBackground(ctx, camX, camY);

    // 2. Plataformas del Nivel
    this.level.renderForeground(ctx, camX, camY);

    // 3. Cápsulas e Ítems
    this.capsules.forEach((c) => c.render(ctx, camX, camY));
    this.powerUps.forEach((p) => p.render(ctx, camX, camY));

    // 4. Enemigos Comunes
    this.enemies.forEach((e) => e.render(ctx, camX, camY));

    // 5. Jefe Activo
    if (this.activeBoss && this.activeBoss.alive) {
      this.activeBoss.render(ctx, camX, camY);
    }

    // 6. Fontanero Hipermusculoso
    this.player.render(ctx, camX, camY);

    // 7. Proyectiles
    this.playerBullets.forEach((b) => b.render(ctx, camX, camY));
    this.enemyBullets.forEach((b) => b.render(ctx, camX, camY));

    // 8. Partículas y Casquillos Dorados
    this.particles.render(ctx, camX, camY);

    // 9. HUD Retro con Indicador de Nivel (1 al 20) y Barra de Jefe
    if (this.state === 'PLAYING' || this.state === 'PAUSED') {
      this.hud.render(
        ctx,
        this.player,
        this.activeBoss,
        this.currentLevel,
        this.totalLevels,
        this.level.theme.name
      );
    }

    // 10. PANTALLA RÁPIDA DE VICTORIA ("STAGE CLEARED")
    if (this.state === 'STAGE_CLEAR') {
      this.renderStageClearOverlay(ctx);
    }
  }

  private renderStageClearOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Fondo oscurecido con resplandor neón
    ctx.fillStyle = 'rgba(7, 9, 19, 0.85)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const cx = ctx.canvas.width / 2;
    const cy = ctx.canvas.height / 2;

    // Caja decorativa estilo arcade
    const boxW = 340;
    const boxH = 150;
    const boxX = cx - boxW / 2;
    const boxY = cy - boxH / 2;

    ctx.fillStyle = 'rgba(18, 24, 44, 0.95)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Esquinas resaltadas
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(boxX - 2, boxY - 2, 8, 8);
    ctx.fillRect(boxX + boxW - 6, boxY - 2, 8, 8);
    ctx.fillRect(boxX - 2, boxY + boxH - 6, 8, 8);
    ctx.fillRect(boxX + boxW - 6, boxY + boxH - 6, 8, 8);

    // Título Principal "STAGE CLEARED"
    ctx.font = '900 20px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('★ STAGE CLEARED! ★', cx, boxY + 32);

    // Nombre del Nivel superado
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText(this.level.theme.name, cx, boxY + 54);

    // Bonus de Puntuación
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`BONUS DE NIVEL: +${this.stageBonusScore.toLocaleString()} PTS`, cx, boxY + 78);

    // Siguiente Nivel
    const nextLvl = this.currentLevel + 1;
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#a0aec0';
    ctx.fillText(`PREPARANDO STAGE ${nextLvl.toString().padStart(2, '0')}/${this.totalLevels}...`, cx, boxY + 102);

    // Barra dinámica de cuenta regresiva
    const barW = 200;
    const barH = 6;
    const barX = cx - barW / 2;
    const barY = boxY + 116;

    ctx.fillStyle = '#111827';
    ctx.fillRect(barX, barY, barW, barH);

    const progress = Math.max(0, 1 - this.stageClearTimer / this.stageClearDuration);
    ctx.fillStyle = '#39ff14';
    ctx.fillRect(barX, barY, barW * progress, barH);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // Indicación de salto rápido
    ctx.font = '8px monospace';
    ctx.fillStyle = '#ffe600';
    ctx.fillText('PRESIONA DISPARO O TOCA PARA AVANZAR YA', cx, boxY + 138);

    ctx.restore();
  }

  /**
   * Generador y distribuidor de jefes a lo largo de los 20 niveles.
   * Intercala personajes de parodia de El Chavo con animatrónicos hipermusculosos de FNaF.
   */
  public createBossForLevel(level: number, isMidBoss: boolean): BossEntity {
    if (isMidBoss) {
      // Hitos con mini-jefe intermedio: niveles 5, 10, 15, 20
      switch (level) {
        case 5:
          return new BossElChaval(1250, 160, level, 'EL CHAVAL', 'BARRIL DE CHOQUE');
        case 10:
          return new BossDonRamfis(1250, 170, level, 'DON RAMFIS', 'GUARDIA DE LA RENTA');
        case 15:
          return new BossFreddyFazbear(1250, 150, level, 'FREDDY METRALLA', 'INTERCEPTOR BRUTAL');
        case 20:
          return new BossDonRamfis(1250, 170, level, 'DON RAMFIS SUPREMO', '★ EL COBRADOR CÓSMICO ★');
        default:
          return new BossElChaval(1250, 160, level, 'EL CHAVAL', 'MINI-JEFE DE ASALTO');
      }
    }

    // Jefes Principales de Nivel (Stage Bosses al final del mapa)
    switch (level) {
      case 1:
        // Parodia El Chavo: El Chaval
        return new BossElChaval(2050, 160, level, 'EL CHAVAL', 'TANQUE BARRIL COLOSAL');
      case 2:
        // Parodia Don Ramón: Don Ramfis
        return new BossDonRamfis(2050, 170, level, 'DON RAMFIS', 'ABDOMINALES DE ACERO');
      case 3:
        // FNaF: Freddy Fazbear
        return new BossFreddyFazbear(2050, 150, level, 'FREDDY FAZBEAR', 'EL OSO METRALLA');
      case 4:
        // FNaF: Bonnie el Conejo
        return new BossBonnie(2050, 160, level, 'BONNIE EL CONEJO', 'EL GUITARRISTA ACORAZADO');
      case 5:
        // FNaF: Chica y Mr. Cupcake
        return new BossChica(2050, 160, level, 'CHICA Y MR. CUPCAKE', 'FURIA COMBATIVA Y VAPOR TÓXICO');
      case 6:
        // FNaF: Foxy el Zorro Pirata
        return new BossFoxy(2050, 170, level, 'FOXY EL ZORRO PIRATA', 'VELOCISTA DE ASALTO');
      case 7:
        // Parodia El Chavo: El Chaval Reforzado
        return new BossElChaval(2050, 160, level, 'EL CHAVAL MK-II', 'BARRIL BLINDADO');
      case 8:
        // Parodia Don Ramón: Don Ramfis Furioso
        return new BossDonRamfis(2050, 170, level, 'DON RAMFIS FURIOSO', 'LLUVIA DE SOMBREROS');
      case 9:
        // FNaF: Freddy Fazbear
        return new BossFreddyFazbear(2050, 150, level, 'FREDDY METRALLA', 'BALADA DE GUERRA SÓNICA');
      case 10:
        // FNaF: Bonnie el Conejo
        return new BossBonnie(2050, 160, level, 'BONNIE OVERDRIVE', 'SOLO DE GUITARRA LÁSER');
      case 11:
        // FNaF: Chica y Mr. Cupcake
        return new BossChica(2050, 160, level, 'CHICA MUTANTE', 'HORNO QUÍMICO TÓXICO');
      case 12:
        // FNaF: Foxy el Zorro Pirata
        return new BossFoxy(2050, 170, level, 'FOXY PIRATA VELOZ', 'EMBESTIDA HIPERSÓNICA');
      case 13:
        // Parodia El Chavo: El Chaval Titán
        return new BossElChaval(2050, 160, level, 'EL CHAVAL TITÁN', 'BARRIL MECA VOLCÁNICO');
      case 14:
        // Parodia Don Ramón: Don Ramfis Ciber-Boxer
        return new BossDonRamfis(2050, 170, level, 'DON RAMFIS CIBER-BOXER', 'GOLPES DE 14 MESES');
      case 15:
        // FNaF: Foxy Dreadnought
        return new BossFoxy(2050, 170, level, 'FOXY DREADNOUGHT', 'TERROR DE LA PLANTA');
      case 16:
        // FNaF: Bonnie Cyber-Shredder
        return new BossBonnie(2050, 160, level, 'BONNIE CYBER-SHREDDER', 'TELETRANSPORTE SÓNICO');
      case 17:
        // FNaF: Chica Reina Apocalipsis
        return new BossChica(2050, 160, level, 'CHICA REINA APOCALIPSIS', 'CUPCAKE RADIOACTIVO');
      case 18:
        // FNaF: Freddy Fazbear Pesadilla
        return new BossFreddyFazbear(2050, 150, level, 'FREDDY PESADILLA', 'RÁFAGAS SINFÓNICAS');
      case 19:
        // Parodia El Chavo: El Chaval Apoteósico
        return new BossElChaval(2050, 160, level, 'EL CHAVAL APOTEÓSICO', 'CAÑÓN DE TORTAS DE JAMÓN');
      case 20:
      default:
        // FNaF Final Supremo: Freddy Fazbear Supremo
        return new BossFreddyFazbear(
          2050,
          150,
          20,
          'FREDDY FAZBEAR SUPREMO',
          '★ EMPERADOR MECATRÓNICO DEL UNIVERSO ★'
        );
    }
  }
}
