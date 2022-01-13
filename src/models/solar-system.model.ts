import { GameScene } from "../scenes/Game";
import { useCanvas } from "../services/canvas.service"

export class SolarSystem {
  public sunObject: Phaser.Physics.Arcade.Sprite;

  private canvas = useCanvas();

  constructor(
    private scene: GameScene
  ) {
    const postion = this.canvas.getCenter();
    const diameter = this.canvas.getPercentageHeight(95);

    this.scene.add.circle(postion.x, postion.y, diameter / 2, 0xffffff, 0.4);
    this.sunObject = this.scene.physics.add.sprite(postion.x, postion.y, "planet1");
    this.sunObject.setOrigin(0.5, 0.5);
    this.sunObject.body.setCircle(50);
    this.sunObject.setScale(1.1);
  }
}
