import { GameScene } from "../scenes/Game";
import { useCanvas } from "../services/canvas.service"

export class Planet {
  public isAI = true;;
  public object: Phaser.Physics.Arcade.Sprite;
  public destroyed = false;

  private canvas = useCanvas();
  private diameter = this.canvas.getPercentageHeight(4);

  constructor(
    private scene: GameScene,
    private position: Phaser.Math.Vector2,
  ) {
    this.object = this.scene.physics.add.sprite(this.position.x, this.position.y, "planet1");
    this.object.setOrigin(0.5, 0.5);
    this.object.body.setCircle(30);
    this.object.setScale(0.6);
    this.object.setData("planet", this);
    this.object.setBounce(1);
    this.object.setDrag(200);
  }

  public update() {
    if (this.isAI) {

    }
  }

  public move(direction: number) {
    this.object.setDrag(0);
    const x = Math.cos(Phaser.Math.DegToRad(direction)) * 700;
    const y = Math.sin(Phaser.Math.DegToRad(direction)) * 700;
    this.object.body.velocity.lerp(new Phaser.Math.Vector2(x, y), 0.035);
  }

  public destroy() {
    console.log("DEATH!");
    this.object.destroy();
    this.destroyed = true;
  }

  private getStartingPostion() {
    return {
      x: Phaser.Math.Between(this.canvas.getPercentageHeight(8), this.canvas.getPercentageHeight(50)),
      y: Phaser.Math.Between(this.canvas.getPercentageHeight(8), this.canvas.getPercentageHeight(50))
    }
  }
}
