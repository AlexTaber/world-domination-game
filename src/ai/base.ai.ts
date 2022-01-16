import { Planet } from "../models/planet.model";
import { GameScene } from "../scenes/Game";

export interface AIInput {
  direction: number;
  throttle: number;
}

export interface AI {
  getInput(): AIInput;
  reset(): void;
}

export class BaseAI {
  constructor(
    protected planet: Planet,
    protected game: GameScene,
  ) {}

  public reset() {}

  protected getDirectionToPoint(point: { x: number, y: number }) {
    const planetPosition = this.planet.object.body.position;
    return Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(planetPosition.x, planetPosition.y, point.x, point.y));
  }
}
