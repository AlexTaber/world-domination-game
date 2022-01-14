import { GameScene } from "../scenes/Game";
import { useCanvas } from "../services/canvas.service"

export class SolarSystem {
  public sunObject: Phaser.Physics.Arcade.Sprite;
  public diameter: number;

  private canvas = useCanvas();
  private orbitSpace;

  constructor(
    private scene: GameScene
  ) {
    const position = this.canvas.getCenter();
    this.diameter = this.canvas.getPercentageHeight(95);

    const background = this.scene.add.image(400, 300, "background");
    background.setScale(1.1);
    this.orbitSpace = this.scene.add.circle(position.x, position.y, this.radius, 0xffffff, 0.15);
    this.sunObject = this.scene.physics.add.sprite(position.x, position.y, "sun");
    this.sunObject.setScale(0.7);
    this.sunObject.setOrigin(0.5, 0.5);
    const size = 40;
    this.sunObject.body.setOffset((this.sunObject.body.width / 2) - size, (this.sunObject.body.width / 2) - size);
    this.sunObject.body.setCircle(size);
  }

  public get radius() : number {
    return this.diameter / 2;
  }  

  public shrink(ratio: number = 0.5) {
    if (this.diameter > this.sunObject.body.width) {
      this.diameter *= ratio;
      this.orbitSpace.setRadius(this.radius);
    }
  }

  public reset() {
    this.diameter = this.canvas.getPercentageHeight(95);
    this.orbitSpace.setRadius(this.radius);
  }
}
