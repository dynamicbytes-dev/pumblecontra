/**
 * Level - Generación del mapa, plataformas, decorado parallax y ambientación temática para 20 Niveles
 * Cada nivel cuenta con su propia paleta cromática, diseño de bioma y tono de fondo progresivo.
 */

import { Rect } from './entities/Entity';

export interface LevelTheme {
  levelNumber: number;
  name: string;
  subtitle: string;
  skyColors: [string, string, string]; // Top, Mid, Bottom
  mountainColor: string;
  treeFoliageColor: string;
  treeTrunkColor: string;
  platformSurfaceColor: string;
  platformBaseColor: string;
  platformDetailColor: string;
  floatPlatformSurface: string;
  floatPlatformBase: string;
  liquidColor: string;
  liquidFoamColor: string;
  liquidItemType: 'DUCK' | 'RADIOACTIVE_EYE' | 'BURNING_SAUSAGE' | 'ALIEN_SKULL';
}

export const LEVEL_THEMES: LevelTheme[] = [
  // Nivel 1: Jungla Retro - El Chaval (Chavo)
  {
    levelNumber: 1,
    name: 'STAGE 01: JUNGLA CHATARRA',
    subtitle: 'VS. EL CHAVAL (BARRIL TANQUE)',
    skyColors: ['#0a1931', '#153b64', '#1b5e20'],
    mountainColor: '#0f2f3f',
    treeFoliageColor: '#1e5e2e',
    treeTrunkColor: '#3e2723',
    platformSurfaceColor: '#39ff14',
    platformBaseColor: '#4a2c11',
    platformDetailColor: '#6d421e',
    floatPlatformSurface: '#2e7d32',
    floatPlatformBase: '#654321',
    liquidColor: '#00e5ff',
    liquidFoamColor: '#ffffff',
    liquidItemType: 'DUCK',
  },
  // Nivel 2: Pantano Tóxico - Don Ramfis (Don Ramón)
  {
    levelNumber: 2,
    name: 'STAGE 02: PANTANO TÓXICO',
    subtitle: 'VS. DON RAMFIS (SOMBREROS FILOSOS)',
    skyColors: ['#041f17', '#0d4731', '#166534'],
    mountainColor: '#093322',
    treeFoliageColor: '#15803d',
    treeTrunkColor: '#2b1e16',
    platformSurfaceColor: '#a3e635',
    platformBaseColor: '#2d3748',
    platformDetailColor: '#475569',
    floatPlatformSurface: '#4ade80',
    floatPlatformBase: '#334155',
    liquidColor: '#22c55e',
    liquidFoamColor: '#bbf7d0',
    liquidItemType: 'RADIOACTIVE_EYE',
  },
  // Nivel 3: Cañón Crepuscular - Freddy Fazbear (FNaF)
  {
    levelNumber: 3,
    name: 'STAGE 03: CAÑÓN CREPUSCULAR',
    subtitle: 'VS. FREDDY FAZBEAR (OSO METRALLA)',
    skyColors: ['#2e0821', '#661935', '#882b24'],
    mountainColor: '#451020',
    treeFoliageColor: '#78350f',
    treeTrunkColor: '#451a03',
    platformSurfaceColor: '#f97316',
    platformBaseColor: '#522512',
    platformDetailColor: '#7c2d12',
    floatPlatformSurface: '#ea580c',
    floatPlatformBase: '#431407',
    liquidColor: '#f59e0b',
    liquidFoamColor: '#fef3c7',
    liquidItemType: 'BURNING_SAUSAGE',
  },
  // Nivel 4: Ruinas de Neón - Bonnie el Conejo (FNaF)
  {
    levelNumber: 4,
    name: 'STAGE 04: RUINAS DE NEÓN',
    subtitle: 'VS. BONNIE (GUITARRISTA ACORAZADO)',
    skyColors: ['#12082b', '#3b1054', '#581c87'],
    mountainColor: '#2e1065',
    treeFoliageColor: '#9333ea',
    treeTrunkColor: '#3b0764',
    platformSurfaceColor: '#00f0ff',
    platformBaseColor: '#1e1b4b',
    platformDetailColor: '#4338ca',
    floatPlatformSurface: '#38bdf8',
    floatPlatformBase: '#1e1b4b',
    liquidColor: '#ec4899',
    liquidFoamColor: '#fbcfe8',
    liquidItemType: 'DUCK',
  },
  // Nivel 5: Fortaleza Militar - Hito 1: Chica & Mr. Cupcake (FNaF)
  {
    levelNumber: 5,
    name: 'STAGE 05: FORTALEZA MILITAR',
    subtitle: 'HITO 1: VS. CHICA & MR. CUPCAKE',
    skyColors: ['#111827', '#1f2937', '#374151'],
    mountainColor: '#1f2937',
    treeFoliageColor: '#4b5563',
    treeTrunkColor: '#111827',
    platformSurfaceColor: '#eab308',
    platformBaseColor: '#1f2937',
    platformDetailColor: '#4b5563',
    floatPlatformSurface: '#ca8a04',
    floatPlatformBase: '#111827',
    liquidColor: '#0284c7',
    liquidFoamColor: '#e0f2fe',
    liquidItemType: 'ALIEN_SKULL',
  },
  // Nivel 6: Desierto Radiactivo - Foxy el Zorro Pirata (FNaF)
  {
    levelNumber: 6,
    name: 'STAGE 06: DESIERTO RADIACTIVO',
    subtitle: 'VS. FOXY EL ZORRO PIRATA',
    skyColors: ['#2c1a05', '#57340b', '#78350f'],
    mountainColor: '#451a03',
    treeFoliageColor: '#854d0e',
    treeTrunkColor: '#291204',
    platformSurfaceColor: '#facc15',
    platformBaseColor: '#451a03',
    platformDetailColor: '#78350f',
    floatPlatformSurface: '#eab308',
    floatPlatformBase: '#361404',
    liquidColor: '#84cc16',
    liquidFoamColor: '#ecfccb',
    liquidItemType: 'RADIOACTIVE_EYE',
  },
  // Nivel 7: Cavernas de Cristal - El Chaval MK-II (Chavo)
  {
    levelNumber: 7,
    name: 'STAGE 07: CAVERNAS DE CRISTAL',
    subtitle: 'VS. EL CHAVAL MK-II (BARRIL BLINDADO)',
    skyColors: ['#17062e', '#361066', '#581c87'],
    mountainColor: '#250849',
    treeFoliageColor: '#7e22ce',
    treeTrunkColor: '#3b0764',
    platformSurfaceColor: '#c084fc',
    platformBaseColor: '#1e1b4b',
    platformDetailColor: '#4c1d95',
    floatPlatformSurface: '#a855f7',
    floatPlatformBase: '#2e1065',
    liquidColor: '#8b5cf6',
    liquidFoamColor: '#ede9fe',
    liquidItemType: 'DUCK',
  },
  // Nivel 8: Ciudad en Llamas - Don Ramfis Furioso (Don Ramón)
  {
    levelNumber: 8,
    name: 'STAGE 08: CIUDAD EN LLAMAS',
    subtitle: 'VS. DON RAMFIS FURIOSO',
    skyColors: ['#310505', '#650f0f', '#991b1b'],
    mountainColor: '#450a0a',
    treeFoliageColor: '#b91c1c',
    treeTrunkColor: '#200505',
    platformSurfaceColor: '#ef4444',
    platformBaseColor: '#3b0d0d',
    platformDetailColor: '#7f1d1d',
    floatPlatformSurface: '#dc2626',
    floatPlatformBase: '#260606',
    liquidColor: '#f97316',
    liquidFoamColor: '#ffedd5',
    liquidItemType: 'BURNING_SAUSAGE',
  },
  // Nivel 9: Pantano Electrónico - Freddy Fazbear (FNaF)
  {
    levelNumber: 9,
    name: 'STAGE 09: PANTANO ELECTRÓNICO',
    subtitle: 'VS. FREDDY METRALLA (BALADA SÓNICA)',
    skyColors: ['#021820', '#06424e', '#0e7490'],
    mountainColor: '#083344',
    treeFoliageColor: '#0891b2',
    treeTrunkColor: '#041f28',
    platformSurfaceColor: '#06b6d4',
    platformBaseColor: '#082f3a',
    platformDetailColor: '#155e75',
    floatPlatformSurface: '#22d3ee',
    floatPlatformBase: '#0e3a47',
    liquidColor: '#06b6d4',
    liquidFoamColor: '#cffafe',
    liquidItemType: 'RADIOACTIVE_EYE',
  },
  // Nivel 10: Núcleo Magmático - Hito 2: Bonnie Overdrive (FNaF)
  {
    levelNumber: 10,
    name: 'STAGE 10: NÚCLEO MAGMÁTICO',
    subtitle: 'HITO 2: VS. BONNIE OVERDRIVE',
    skyColors: ['#3b0707', '#7f1d1d', '#b91c1c'],
    mountainColor: '#450a0a',
    treeFoliageColor: '#ea580c',
    treeTrunkColor: '#1a0505',
    platformSurfaceColor: '#f59e0b',
    platformBaseColor: '#290707',
    platformDetailColor: '#5c1010',
    floatPlatformSurface: '#d97706',
    floatPlatformBase: '#1c0505',
    liquidColor: '#ef4444',
    liquidFoamColor: '#fef08a',
    liquidItemType: 'BURNING_SAUSAGE',
  },
  // Nivel 11: Bosque Cibernético - Chica Mutante (FNaF)
  {
    levelNumber: 11,
    name: 'STAGE 11: BOSQUE CIBERNÉTICO',
    subtitle: 'VS. CHICA MUTANTE (HORNO TÓXICO)',
    skyColors: ['#022c22', '#065f46', '#047857'],
    mountainColor: '#022c22',
    treeFoliageColor: '#10b981',
    treeTrunkColor: '#064e3b',
    platformSurfaceColor: '#34d399',
    platformBaseColor: '#022c22',
    platformDetailColor: '#065f46',
    floatPlatformSurface: '#10b981',
    floatPlatformBase: '#064e3b',
    liquidColor: '#10b981',
    liquidFoamColor: '#d1fae5',
    liquidItemType: 'DUCK',
  },
  // Nivel 12: Glaciar Tóxico - Foxy Pirata (FNaF)
  {
    levelNumber: 12,
    name: 'STAGE 12: GLACIAR TÓXICO',
    subtitle: 'VS. FOXY PIRATA (EMBESTIDA SÓNICA)',
    skyColors: ['#082f49', '#0369a1', '#0284c7'],
    mountainColor: '#0c4a6e',
    treeFoliageColor: '#38bdf8',
    treeTrunkColor: '#082f49',
    platformSurfaceColor: '#7dd3fc',
    platformBaseColor: '#0f172a',
    platformDetailColor: '#1e293b',
    floatPlatformSurface: '#bae6fd',
    floatPlatformBase: '#0f172a',
    liquidColor: '#38bdf8',
    liquidFoamColor: '#f0f9ff',
    liquidItemType: 'ALIEN_SKULL',
  },
  // Nivel 13: Luna Sangrienta - El Chaval Titán (Chavo)
  {
    levelNumber: 13,
    name: 'STAGE 13: LUNA SANGRIENTA',
    subtitle: 'VS. EL CHAVAL TITÁN (BARRIL VOLCÁNICO)',
    skyColors: ['#280210', '#540822', '#7a0e33'],
    mountainColor: '#3d0517',
    treeFoliageColor: '#be123c',
    treeTrunkColor: '#1f020c',
    platformSurfaceColor: '#fb7185',
    platformBaseColor: '#360613',
    platformDetailColor: '#600b22',
    floatPlatformSurface: '#f43f5e',
    floatPlatformBase: '#25040d',
    liquidColor: '#e11d48',
    liquidFoamColor: '#ffe4e6',
    liquidItemType: 'BURNING_SAUSAGE',
  },
  // Nivel 14: Abismo Violeta - Don Ramfis Ciber-Boxer (Don Ramón)
  {
    levelNumber: 14,
    name: 'STAGE 14: ABISMO VIOLETA',
    subtitle: 'VS. DON RAMFIS (GOLPES DE 14 MESES)',
    skyColors: ['#0b0416', '#1c0a36', '#2e1065'],
    mountainColor: '#140628',
    treeFoliageColor: '#6d28d9',
    treeTrunkColor: '#090212',
    platformSurfaceColor: '#a78bfa',
    platformBaseColor: '#150926',
    platformDetailColor: '#301354',
    floatPlatformSurface: '#8b5cf6',
    floatPlatformBase: '#140526',
    liquidColor: '#9333ea',
    liquidFoamColor: '#f3e8ff',
    liquidItemType: 'RADIOACTIVE_EYE',
  },
  // Nivel 15: Planta Química - Hito 3: Foxy Dreadnought (FNaF)
  {
    levelNumber: 15,
    name: 'STAGE 15: PLANTA QUÍMICA',
    subtitle: 'HITO 3: VS. FOXY DREADNOUGHT',
    skyColors: ['#1a2e05', '#365314', '#4d7c0f'],
    mountainColor: '#273e07',
    treeFoliageColor: '#65a30d',
    treeTrunkColor: '#142203',
    platformSurfaceColor: '#bef264',
    platformBaseColor: '#1f2e05',
    platformDetailColor: '#3a5209',
    floatPlatformSurface: '#a3e635',
    floatPlatformBase: '#182404',
    liquidColor: '#84cc16',
    liquidFoamColor: '#f7fee7',
    liquidItemType: 'RADIOACTIVE_EYE',
  },
  // Nivel 16: Base Subterránea - Bonnie Cyber-Shredder (FNaF)
  {
    levelNumber: 16,
    name: 'STAGE 16: BASE SUBTERRÁNEA',
    subtitle: 'VS. BONNIE CYBER-SHREDDER',
    skyColors: ['#0f172a', '#1e293b', '#334155'],
    mountainColor: '#0f172a',
    treeFoliageColor: '#475569',
    treeTrunkColor: '#020617',
    platformSurfaceColor: '#38bdf8',
    platformBaseColor: '#0f172a',
    platformDetailColor: '#1e293b',
    floatPlatformSurface: '#0284c7',
    floatPlatformBase: '#020617',
    liquidColor: '#0ea5e9',
    liquidFoamColor: '#e0f2fe',
    liquidItemType: 'ALIEN_SKULL',
  },
  // Nivel 17: Templo Alienígena - Chica Reina Apocalipsis (FNaF)
  {
    levelNumber: 17,
    name: 'STAGE 17: TEMPLO ALIENÍGENA',
    subtitle: 'VS. CHICA REINA APOCALIPSIS',
    skyColors: ['#180828', '#38125a', '#581c87'],
    mountainColor: '#240b3c',
    treeFoliageColor: '#a21caf',
    treeTrunkColor: '#150522',
    platformSurfaceColor: '#f0abfc',
    platformBaseColor: '#2e0854',
    platformDetailColor: '#4c1d95',
    floatPlatformSurface: '#d946ef',
    floatPlatformBase: '#20053b',
    liquidColor: '#c026d3',
    liquidFoamColor: '#fae8ff',
    liquidItemType: 'DUCK',
  },
  // Nivel 18: Órbita Roja - Freddy Pesadilla (FNaF)
  {
    levelNumber: 18,
    name: 'STAGE 18: ÓRBITA ROJA',
    subtitle: 'VS. FREDDY PESADILLA (SINFONÍA DE GUERRA)',
    skyColors: ['#380808', '#661414', '#991b1b'],
    mountainColor: '#480c0c',
    treeFoliageColor: '#dc2626',
    treeTrunkColor: '#240404',
    platformSurfaceColor: '#f87171',
    platformBaseColor: '#3b0a0a',
    platformDetailColor: '#631212',
    floatPlatformSurface: '#ef4444',
    floatPlatformBase: '#290606',
    liquidColor: '#f97316',
    liquidFoamColor: '#ffedd5',
    liquidItemType: 'BURNING_SAUSAGE',
  },
  // Nivel 19: Puerta del Caos - El Chaval Apoteósico (Chavo)
  {
    levelNumber: 19,
    name: 'STAGE 19: PUERTA DEL CAOS',
    subtitle: 'VS. EL CHAVAL APOTEÓSICO',
    skyColors: ['#1c0429', '#3e0c59', '#6b21a8'],
    mountainColor: '#2a073d',
    treeFoliageColor: '#c026d3',
    treeTrunkColor: '#14021e',
    platformSurfaceColor: '#e879f9',
    platformBaseColor: '#290847',
    platformDetailColor: '#4a1575',
    floatPlatformSurface: '#c084fc',
    floatPlatformBase: '#1e0534',
    liquidColor: '#d946ef',
    liquidFoamColor: '#fdf4ff',
    liquidItemType: 'ALIEN_SKULL',
  },
  // Nivel 20: Núcleo Alien Supremo - Freddy Fazbear Supremo (Gran Final FNaF)
  {
    levelNumber: 20,
    name: 'STAGE 20: NÚCLEO ALIEN SUPREMO',
    subtitle: '★ GRAN FINAL: VS. FREDDY FAZBEAR SUPREMO ★',
    skyColors: ['#330005', '#6b0014', '#a10022'],
    mountainColor: '#45000d',
    treeFoliageColor: '#ffd700',
    treeTrunkColor: '#260007',
    platformSurfaceColor: '#ffd700',
    platformBaseColor: '#3d000d',
    platformDetailColor: '#700017',
    floatPlatformSurface: '#f59e0b',
    floatPlatformBase: '#290008',
    liquidColor: '#ff0033',
    liquidFoamColor: '#fffbeb',
    liquidItemType: 'BURNING_SAUSAGE',
  },
];

export class Level {
  public width = 2400; // Nivel horizontal extenso
  public height = 270;
  public platforms: Rect[] = [];
  public currentLevel = 1;
  public theme: LevelTheme;

  constructor(levelNumber: number = 1) {
    this.currentLevel = Math.max(1, Math.min(20, levelNumber));
    this.theme = this.getThemeForLevel(this.currentLevel);
    this.buildLevelLayout();
  }

  public setLevel(levelNumber: number): void {
    this.currentLevel = Math.max(1, Math.min(20, levelNumber));
    this.theme = this.getThemeForLevel(this.currentLevel);
    this.buildLevelLayout();
  }

  public getThemeForLevel(lvl: number): LevelTheme {
    const idx = (lvl - 1) % LEVEL_THEMES.length;
    return LEVEL_THEMES[idx] || LEVEL_THEMES[0];
  }

  private buildLevelLayout(): void {
    // Generamos las plataformas clásicas con sutiles variaciones según nivel
    const lvl = this.currentLevel;
    const gapExtra = Math.min(30, Math.floor(lvl * 1.5));

    this.platforms = [
      // Suelo principal inicial
      { x: 0, y: 230, width: 600 - gapExtra, height: 40 },
      // Plataformas elevadas
      { x: 120, y: 175, width: 100, height: 12 },
      { x: 260, y: 135, width: 110, height: 12 },
      { x: 420, y: 175, width: 120, height: 12 },

      // Foso de agua / puente intermedio
      { x: 670, y: 230, width: 450, height: 40 },
      { x: 720, y: 165, width: 130, height: 12 },
      { x: 900, y: 125, width: 140, height: 12 },

      // Segunda sección: Colinas y bases intermedias
      { x: 1190, y: 230, width: 500, height: 40 },
      { x: 1260, y: 180, width: 90, height: 12 },
      { x: 1400, y: 140, width: 110, height: 12 },
      { x: 1550, y: 180, width: 90, height: 12 },

      // Arena final del Boss
      { x: 1760, y: 230, width: 640, height: 40 },
      { x: 1850, y: 160, width: 120, height: 12 },
      { x: 2050, y: 160, width: 120, height: 12 },
    ];
  }

  public renderBackground(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    const t = this.theme;

    // 1. Cielo gradiente retro personalizado para el nivel
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, t.skyColors[0]);
    skyGrad.addColorStop(0.5, t.skyColors[1]);
    skyGrad.addColorStop(1, t.skyColors[2]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 2. Parallax de Montañas lejanas
    const mtnX = -(cameraX * 0.15) % 240;
    ctx.fillStyle = t.mountainColor;
    for (let x = mtnX - 240; x < ctx.canvas.width + 240; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 230);
      ctx.lineTo(x + 60, 110);
      ctx.lineTo(x + 120, 230);
      ctx.fill();
    }

    // 3. Parallax de Arboleda / Vegetación del bioma (velocidad 0.4)
    const treeX = -(cameraX * 0.4) % 180;
    for (let x = treeX - 180; x < ctx.canvas.width + 180; x += 90) {
      // Copa del bioma
      ctx.fillStyle = t.treeFoliageColor;
      ctx.beginPath();
      ctx.arc(x + 45, 170, 28, 0, Math.PI * 2);
      ctx.fill();

      // Tronco o pilar
      ctx.fillStyle = t.treeTrunkColor;
      ctx.fillRect(x + 42, 180, 6, 50);
    }

    // 4. Cascada cómica alrededor de X = 610
    const waterfallX = 610 - cameraX;
    if (waterfallX > -60 && waterfallX < ctx.canvas.width + 60) {
      ctx.fillStyle = t.liquidColor;
      ctx.fillRect(waterfallX, 100, 50, 140);

      // Espuma animada
      const foamOffset = (Date.now() / 60) % 15;
      ctx.fillStyle = t.liquidFoamColor;
      for (let y = 100 + foamOffset; y < 240; y += 15) {
        ctx.fillRect(waterfallX + 4, y, 42, 3);
      }

      // Elemento Slapstick cayendo cómicamente en la cascada
      const itemY = 110 + ((Date.now() / 8) % 120);
      this.renderWaterfallSlapstick(ctx, waterfallX + 22, itemY, t.liquidItemType);
    }
  }

  private renderWaterfallSlapstick(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: 'DUCK' | 'RADIOACTIVE_EYE' | 'BURNING_SAUSAGE' | 'ALIEN_SKULL'
  ): void {
    ctx.save();
    if (type === 'DUCK') {
      // Patito de goma
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(x, y, 10, 8);
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(x + 8, y + 3, 4, 3);
    } else if (type === 'RADIOACTIVE_EYE') {
      // Ojo radiactivo flotante
      ctx.fillStyle = '#39ff14';
      ctx.beginPath();
      ctx.arc(x + 5, y + 5, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 4, y + 4, 3, 3);
    } else if (type === 'BURNING_SAUSAGE') {
      // Salchicha ardiente
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(x, y + 2, 12, 6);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x + 2, y - 2, 8, 4);
    } else {
      // Calavera alienígena
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x, y, 10, 9);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 2, y + 3, 2, 3);
      ctx.fillRect(x + 6, y + 3, 2, 3);
    }
    ctx.restore();
  }

  public renderForeground(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    const t = this.theme;

    for (const p of this.platforms) {
      const sx = Math.floor(p.x - cameraX);
      const sy = Math.floor(p.y - cameraY);

      if (sx + p.width < 0 || sx > ctx.canvas.width) continue;

      ctx.save();
      if (p.height > 20) {
        // Suelo grueso
        // Superficie iluminada
        ctx.fillStyle = t.platformSurfaceColor;
        ctx.fillRect(sx, sy, p.width, 5);

        // Capa base
        ctx.fillStyle = t.platformBaseColor;
        ctx.fillRect(sx, sy + 5, p.width, p.height - 5);

        // Textura pixelada de bloques / rocas
        ctx.fillStyle = t.platformDetailColor;
        for (let bx = sx + 8; bx < sx + p.width - 8; bx += 24) {
          ctx.fillRect(bx, sy + 10, 10, 6);
          ctx.fillRect(bx + 12, sy + 20, 8, 5);
        }
      } else {
        // Plataforma flotante
        ctx.fillStyle = t.floatPlatformSurface;
        ctx.fillRect(sx, sy, p.width, 3);

        ctx.fillStyle = t.floatPlatformBase;
        ctx.fillRect(sx, sy + 3, p.width, p.height - 3);

        ctx.fillStyle = t.platformDetailColor;
        for (let bx = sx + 6; bx < sx + p.width; bx += 16) {
          ctx.fillRect(bx, sy + 1, 3, 2);
        }
      }
      ctx.restore();
    }
  }
}
