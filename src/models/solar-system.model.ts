import { GameScene } from "../scenes/Game";
import { useCanvas } from "../services/canvas.service"

export class SolarSystem {
  public sunObject: Phaser.Physics.Arcade.Sprite;
  public diameter: number;

  private canvas = useCanvas();

  constructor(
    private scene: GameScene
  ) {
    const postion = this.canvas.getCenter();
    this.diameter = this.canvas.getPercentageHeight(95);

    const background = this.scene.add.image(400, 300, "background");
    background.setScale(1.1);
    this.scene.add.circle(postion.x, postion.y, this.diameter / 2, 0xffffff, 0.15);
    this.sunObject = this.scene.physics.add.sprite(postion.x, postion.y, "sun");
    this.sunObject.setScale(0.7);
    this.sunObject.setOrigin(0.5, 0.5);
    const size = 40;
    this.sunObject.body.setOffset((this.sunObject.body.width / 2) - size, (this.sunObject.body.width / 2) - size);
    this.sunObject.body.setCircle(size);
  }
}
