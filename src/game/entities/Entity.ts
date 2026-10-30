/**
 * Entity - Clase base para entidades 2D con física AABB y estados
 */

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export abstract class Entity {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public vx = 0;
  public vy = 0;
  public isGrounded = false;
  public alive = true;
  public facingRight = true;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public getBounds(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  public static checkCollision(a: Rect, b: Rect): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  public abstract update(dt: number, levelPlatforms: Rect[]): void;
  public abstract render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void;
}
