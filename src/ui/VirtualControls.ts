/**
 * VirtualControls - Joystick virtual táctil y botones de acción para móvil y Capacitor
 * Incluye Joystick analógico con conversión precisa a 8 direcciones y autofire ergonómico.
 */

import { InputManager } from '../core/Input';
import { StorageManager } from '../core/Storage';

export class VirtualControls {
  private container: HTMLElement;
  private joystickZone: HTMLElement | null = null;
  private joystickThumb: HTMLElement | null = null;
  private isJoystickActive = false;
  private joystickCenter = { x: 0, y: 0 };
  private activeTouchId: number | null = null;
  private maxRadius = 42; // Radio máximo del thumbstick

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) {
      this.container = document.createElement('div');
      this.container.id = containerId;
      document.body.appendChild(this.container);
    } else {
      this.container = el;
    }

    this.renderControls();
    this.attachEventListeners();
    this.applySettings();
  }

  public applySettings(): void {
    const settings = StorageManager.getInstance().getSettings();
    this.container.style.opacity = settings.controlOpacity.toString();
    this.container.style.transform = `scale(${settings.controlScale})`;
  }

  private renderControls(): void {
    this.container.innerHTML = `
      <!-- JOYSTICK VIRTUAL TÁCTIL EN PANTALLA -->
      <div id="virtual-joystick-container" class="virtual-joystick-zone" aria-label="Joystick Virtual">
        <div class="joystick-base">
          <div class="joystick-guide vertical"></div>
          <div class="joystick-guide horizontal"></div>
          <div class="joystick-guide diagonal-1"></div>
          <div class="joystick-guide diagonal-2"></div>
          <div id="joystick-thumb" class="joystick-thumb">
            <div class="thumb-core"></div>
          </div>
        </div>
      </div>

      <!-- BOTONES DE ACCIÓN (DISPARO CONTINUO & SALTO ARCADE) -->
      <div id="virtual-actions" class="virtual-actions-container" aria-label="Botones de acción táctiles">
        <div class="action-buttons-wrapper">
          <button id="btn-action-b" class="action-btn btn-jump" aria-label="Saltar (B)">
            <span class="btn-label">B</span>
            <span class="btn-subtext">JUMP</span>
          </button>
          <button id="btn-action-a" class="action-btn btn-fire" aria-label="Disparar (A) Metralleta">
            <span class="btn-label">A</span>
            <span class="btn-subtext">RAMBO FIRE</span>
          </button>
        </div>
      </div>
    `;

    this.joystickZone = document.getElementById('virtual-joystick-container');
    this.joystickThumb = document.getElementById('joystick-thumb');
  }

  private attachEventListeners(): void {
    const input = InputManager.getInstance();

    // 1. Manejo táctil del Joystick Virtual
    if (this.joystickZone && this.joystickThumb) {
      const startJoystick = (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        this.isJoystickActive = true;
        this.activeTouchId = e.pointerId;

        const rect = this.joystickZone!.getBoundingClientRect();
        this.joystickCenter = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };

        this.updateJoystickPosition(e.clientX, e.clientY);
        this.joystickZone!.classList.add('active');
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      };

      const moveJoystick = (e: PointerEvent) => {
        if (!this.isJoystickActive || e.pointerId !== this.activeTouchId) return;
        e.preventDefault();
        e.stopPropagation();
        this.updateJoystickPosition(e.clientX, e.clientY);
      };

      const stopJoystick = (e: PointerEvent) => {
        if (e.pointerId === this.activeTouchId) {
          this.isJoystickActive = false;
          this.activeTouchId = null;
          input.setVirtualDirection({ x: 0, y: 0 });

          // Retornar palanca al centro
          if (this.joystickThumb) {
            this.joystickThumb.style.transform = `translate(0px, 0px)`;
          }
          this.joystickZone?.classList.remove('active');
        }
      };

      this.joystickZone.addEventListener('pointerdown', startJoystick);
      this.joystickZone.addEventListener('pointermove', moveJoystick);
      this.joystickZone.addEventListener('pointerup', stopJoystick);
      this.joystickZone.addEventListener('pointercancel', stopJoystick);
    }

    // 2. Botón A (FIRE - Metralleta Pesada estilo Rambo con autofire continuo)
    const btnFire = document.getElementById('btn-action-a');
    if (btnFire) {
      const startFire = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        btnFire.classList.add('active');
        input.setVirtualButton('fire', true);
      };

      const endFire = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        btnFire.classList.remove('active');
        input.setVirtualButton('fire', false);
      };

      btnFire.addEventListener('pointerdown', startFire);
      btnFire.addEventListener('pointerup', endFire);
      btnFire.addEventListener('pointercancel', endFire);
      btnFire.addEventListener('pointerleave', endFire);
    }

    // 3. Botón B (JUMP - Salto Arcade)
    const btnJump = document.getElementById('btn-action-b');
    if (btnJump) {
      const startJump = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        btnJump.classList.add('active');
        input.setVirtualButton('jump', true);
      };

      const endJump = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        btnJump.classList.remove('active');
        input.setVirtualButton('jump', false);
      };

      btnJump.addEventListener('pointerdown', startJump);
      btnJump.addEventListener('pointerup', endJump);
      btnJump.addEventListener('pointercancel', endJump);
      btnJump.addEventListener('pointerleave', endJump);
    }
  }

  private updateJoystickPosition(clientX: number, clientY: number): void {
    const dx = clientX - this.joystickCenter.x;
    const dy = clientY - this.joystickCenter.y;
    const distance = Math.hypot(dx, dy);

    // Limitar desplazamiento físico del thumbstick
    const clampedDistance = Math.min(distance, this.maxRadius);
    const angle = Math.atan2(dy, dx);

    const thumbX = Math.cos(angle) * clampedDistance;
    const thumbY = Math.sin(angle) * clampedDistance;

    if (this.joystickThumb) {
      this.joystickThumb.style.transform = `translate(${thumbX}px, ${thumbY}px)`;
    }

    // Si supera la zona muerta, enviar vector director en 8 direcciones
    if (distance > 10) {
      const nx = dx / distance;
      const ny = dy / distance;
      InputManager.getInstance().setVirtualDirection({ x: nx, y: ny });
    } else {
      InputManager.getInstance().setVirtualDirection({ x: 0, y: 0 });
    }
  }

  public setVisible(visible: boolean): void {
    this.container.style.display = visible ? 'flex' : 'none';
  }
}
