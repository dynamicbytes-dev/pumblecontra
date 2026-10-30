/**
 * Camera - Cámara 2D con scroll horizontal suave y Screen Shake cómico
 */

export class Camera {
  public x = 0;
  public y = 0;
  public width: number;
  public height: number;
  public targetX = 0;
  public targetY = 0;

  private shakeIntensity = 0;
  private shakeDecay = 0.9;
  public offsetX = 0;
  public offsetY = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public follow(playerX: number, playerY: number, levelWidth: number, dt: number): void {
    // Mantener al jugador centrado horizontalmente hacia el tercio izquierdo para ver lo que viene adelante
    const desiredX = playerX - this.width * 0.35;
    this.targetX = Math.max(0, Math.min(desiredX, levelWidth - this.width));

    // Scroll suave tipo Contra
    const lerpSpeed = 6.0;
    this.x += (this.targetX - this.x) * Math.min(1.0, lerpSpeed * dt);

    // En Contra clásico el eje Y suele ser fijo o levemente compensado
    this.y = 0;

    // Manejo de Screen Shake
    if (this.shakeIntensity > 0.1) {
      this.offsetX = (Math.random() * 2 - 1) * this.shakeIntensity;
      this.offsetY = (Math.random() * 2 - 1) * this.shakeIntensity;
      this.shakeIntensity *= Math.pow(this.shakeDecay, dt * 60);
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
      this.shakeIntensity = 0;
    }
  }

  public addShake(intensity: number): void {
    this.shakeIntensity = Math.min(15, this.shakeIntensity + intensity);
  }

  public reset(): void {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.shakeIntensity = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }
}
