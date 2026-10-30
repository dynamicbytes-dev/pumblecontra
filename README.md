# 🎮 Pumble Contra: Alien Slapstick 2D

[![Repository](https://img.shields.io/badge/GitHub-dynamicbytes--dev%2Fpumblecontra-181717?style=for-the-badge&logo=github)](https://github.com/dynamicbytes-dev/pumblecontra)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://developer.android.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

Videojuego arcade 2D estilo **"Run and Gun"** (homenaje y parodia humorística inspirada en el mítico *Contra*). Protagonizado por un fontanero hipermusculoso armado con una metralleta pesada estilo Rambo, enfrentando oleadas alienígenas, hongos zombis, lagartos acorazados y temibles jefes paródicos.

Desarrollado con tecnologías web modernas (**HTML5 Canvas**, **TypeScript**, **Vite**, **Web Audio API**) y preparado para distribuirse de manera nativa en dispositivos móviles mediante **Capacitor Android (APK)**.

---

## 📌 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Arsenal de Armas](#-arsenal-de-armas)
- [Enemigos y Jefes](#-enemigos-y-jefes)
- [Esquema de Controles](#-esquema-de-controles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Desarrollo Web](#-instalación-y-desarrollo-web)
- [Compilación de APK para Android](#-compilación-de-apk-para-android)
- [Configuración de Pantalla (Landscape)](#-configuración-de-pantalla-landscape)
- [Repositorio y Créditos](#-repositorio-y-créditos)

---

## 🚀 Características Principales

- **Motor Canvas 2D Retro Widescreen**:
  - Escalado automático pixel-perfect (`image-rendering: pixelated`) con relación de aspecto panorámica.
  - Cámara 2D con seguimiento cinemático suave del jugador y sacudidas de pantalla (*Screen Shake*) en detonaciones e impactos críticos.
  - Fondo multicapa estilo *Parallax* con cascadas y jungla retro animada.
- **Audio Procedural en Tiempo Real (Web Audio API)**:
  - Sin necesidad de cargar archivos MP3/WAV pesados de terceros.
  - Generador Chiptune 8-bit de música de acción en tiempo real con canales de onda cuadrada y modulaciones melódicas.
  - Sintetizador de efectos de sonido procedurales: ráfagas continuas de metralleta, disparos dispersos, zumbidos láser, rebotes, explosiones, fanfarrias y alarmas de jefe.
- **Sistema de Partículas Dinámico**:
  - Casquillos dorados de bala expulsados en tiempo real con física parabólica y rebotes.
  - Fogonazos en la boca del cañón (*muzzle flashes*), humo de impacto y detonaciones con chispas incandescentes.
- **Persistencia Local (`localStorage`)**:
  - **Salón de la Fama**: Registro del Top 10 de mejores puntuaciones (puntos, iniciales del jugador y arma favorita).
  - **Configuraciones de Usuario**: Ajustes de volumen para música y efectos, activación de vibración táctil háptica, y personalización del tamaño y opacidad de los controles virtuales.
- **Totalmente Autónomo (Offline)**:
  - No requiere internet ni servidores backend. Funciona al 100% de manera desconectada tanto en navegador web como instalado en Android.

---

## 🔫 Arsenal de Armas

El sistema cuenta con cápsulas de powerups que caen al eliminar enemigos clave o cápsulas voladoras:

| Arma | Código | Daño | Cadencia | Descripción |
| :--- | :---: | :---: | :---: | :--- |
| **Heavy Machine Gun** | `M` | 1.2 | Súper Alta (0.08s) | Ráfaga continua estilo Rambo con retroceso y expulsión masiva de casquillos dorados. |
| **Sausage Spread** | `S` | 1.5 | Media (0.26s) | Mítico abanico séxtuple de salchichas incandescentes de gran cobertura radial. |
| **Laser Baguette** | `L` | 2.2 | Rápida (0.11s) | Haz hiperbólico de energía crujiente que atraviesa líneas de enemigos. |
| **Banana Boomerang** | `B` | 3.5 | Alta (0.35s) | Proyectil pesado acrobático con trayectoria bumerán y daño masivo por impacto. |
| **Pea Shooter** | `P` | 1.0 | Fuego Rápido (0.16s) | Disparo básico táctico de guisantes a presión. |

---

## 👾 Enemigos y Jefes

1. **Hongos Mutantes Zombis**: Avanzan en manada saltando plataformas para embestir al jugador.
2. **Lagartos Acorazados**: Unidades de asalto pesadas con blindaje y disparos de plasma.
3. **Jefe 1 - "El Chaval" en su Tanque Barril**:
   - Plataforma de combate acorazada de madera reforzada y cañón rotatorio.
   - Lanza proyectiles teledirigidos en forma de tortas de jamón radioactivas.
   - Barra de vida dinámica desplegada en el HUD.
4. **Jefe 2 - "Don Ramfis" (El Padrino del Bigote)**:
   - Juggernaut con abdominales de acero que realiza piruetas acrobáticas y caídas sísmicas.
   - Arroja sombreros bumerán giratorios cortantes y genera ondas de choque en el suelo.

---

## 🕹️ Esquema de Controles

### En Dispositivos Móviles (Táctil)
- **Joystick Virtual Multitouch**: D-Pad de 8 direcciones fluido con centro adaptativo y respuesta táctil háptica.
- **Botón A ("RAMBO FIRE")**: Disparo continuo con autofire y retroceso táctico.
- **Botón B ("JUMP")**: Salto ágil con animación de somersaults giratorios en el aire.
- **Acceso rápido superior**: Botones para Pausa (`||`), Salón de la Fama (`🏆`) y Ajustes (`⚙️`).

### En Teclado (Escritorio)
| Acción | Teclas Primarias | Teclas Secundarias |
| :--- | :--- | :--- |
| **Moverse / Agacharse / Apuntar** | `W`, `A`, `S`, `D` | Flechas direccionales |
| **Disparo Continuo** | `Z` / `J` | `Barra Espaciadora` |
| **Saltar** | `X` / `K` | `Flecha Arriba` (en salto) |
| **Pausar / Reanudar** | `P` | `Escape` |

---

## 📂 Estructura del Proyecto

```text
pumblecontra/
├── android/                        # Proyecto nativo generado por Capacitor
│   ├── app/
│   │   ├── build.gradle            # Configuración Android (applicationId: com.tujuego.pumblecontra)
│   │   └── src/main/
│   │       ├── AndroidManifest.xml # Orientación forzada en sensorLandscape
│   │       ├── java/.../           # MainActivity de Android
│   │       └── res/                # Iconos adaptativos y splash screens
│   ├── build.gradle                # Gradle raíz
│   └── settings.gradle
├── capacitor.config.ts             # Configuración principal de Capacitor
├── index.html                      # HTML de entrada, contenedor Canvas y capas UI
├── package.json                    # Scripts y dependencias
├── tsconfig.json                   # Tipado estricto y configuración TypeScript
├── public/                         # Favicon e iconos vectoriales SVG
└── src/
    ├── core/
    │   ├── Audio.ts                # Motor procedural Web Audio API (Música 8-bit + SFX)
    │   ├── Camera.ts               # Cámara 2D con Screen Shake y seguimiento suave
    │   ├── Engine.ts               # Loop principal con delta time de precisión
    │   ├── Input.ts                # Manager unificado de entradas (teclado + touch)
    │   └── Storage.ts              # Persistencia de High Scores y Ajustes en localStorage
    ├── game/
    │   ├── Game.ts                 # Máquina de estados, oleadas, colisiones y jefes
    │   ├── Level.ts                # Plataformas y Parallax con cascada animada
    │   ├── ParticleSystem.ts       # Partículas de casquillos de bala, humo y explosiones
    │   ├── WeaponSystem.ts         # Definición y mecánicas de las 5 armas
    │   └── entities/
    │       ├── Bullet.ts           # Proyectiles aliados y proyectiles de jefes
    │       ├── Enemy.ts            # Hongos, lagartos y jefes (El Chaval y Don Ramfis)
    │       ├── Entity.ts           # Física AABB y colisiones de plataformas
    │       └── Player.ts           # Fontanero hipermusculoso (8 direcciones, animaciones)
    ├── ui/
    │   ├── HUD.ts                  # Marcadores arcade, vidas y barra de vida de jefes
    │   ├── Modal.ts                # Modales responsivos (Récords, Ajustes, Game Over)
    │   └── VirtualControls.ts      # Controles virtuales multitáctiles en pantalla
    ├── style.css                   # Diseño arcade premium, tipografías y glassmorphism
    ├── main.ts                     # Punto de entrada y ciclo de vida de la aplicación
    └── vite-env.d.ts               # Declaraciones de entorno Vite
```

---

## 💻 Instalación y Desarrollo Web

### 1. Clonar el repositorio
```bash
git clone git@github.com:dynamicbytes-dev/pumblecontra.git
cd pumblecontra
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor local de desarrollo
```bash
npm run dev
```
Abre en tu navegador la dirección indicada (usualmente `http://localhost:5173/`).

### 4. Compilar la versión de producción web
```bash
npm run build
```

---

## 📱 Compilación de APK para Android

El proyecto utiliza **Capacitor** para empaquetar el juego como una aplicación nativa de Android de alto rendimiento.

### Requisitos
- **Node.js** (versión 18 o superior).
- **Java JDK 17 o 21**.
- **Android Studio** o Android SDK command-line tools con la variable `ANDROID_HOME` configurada.

---

### Construir la APK con 1 solo comando

Se ha configurado un script automatizado que compila la web con TypeScript y Vite, sincroniza los assets con la carpeta nativa de Android y genera la APK debug mediante Gradle:

```bash
npm run build:apk
```

La APK compilada se encontrará en:
```text
android/app/build/outputs/apk/debug/app-debug.apk
```

---

### Flujo Manual Paso a Paso

Si prefieres ejecutar cada etapa por separado:

1. **Compilar el frontend con Vite:**
   ```bash
   npm run build
   ```

2. **Copiar y sincronizar los archivos hacia la app Android:**
   ```bash
   npx cap sync android
   ```

3. **Compilar la APK con Gradle:**
   ```bash
   cd android
   ./gradlew assembleDebug
   cd ..
   ```

4. **Instalar en un dispositivo Android conectado por USB (modo depuración):**
   ```bash
   adb install -r android/app/build/outputs/apk/debug/app-debug.apk
   ```

5. **Abrir el proyecto en Android Studio (para generar APK firmada Release o emuladores):**
   ```bash
   npm run cap:open
   ```

---

## 🔄 Configuración de Pantalla (Landscape)

Para garantizar la mejor ergonomía y distribución del Canvas y los controles virtuales, la orientación está bloqueada en modo horizontal en [`android/app/src/main/AndroidManifest.xml`](android/app/src/main/AndroidManifest.xml):

```xml
<activity
    android:name=".MainActivity"
    android:screenOrientation="sensorLandscape"
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation|density"
    android:exported="true">
```

> **Nota:** La directiva `sensorLandscape` mantiene la orientación siempre apaisada, permitiendo girar el dispositivo 180° libremente para comodidad del usuario o conexión de cables.

---

## 📦 Repositorio y Créditos

- **Organización / Desarrollador:** [DynamicBytes](https://github.com/dynamicbytes-dev)
- **Repositorio Oficial:** [`git@github.com:dynamicbytes-dev/pumblecontra.git`](https://github.com/dynamicbytes-dev/pumblecontra.git)
- **Licencia:** Distribuido bajo la Licencia [MIT](LICENSE).
