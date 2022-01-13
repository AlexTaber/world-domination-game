import { GameScene } from "../scenes/Game";
import { useCanvas } from "../services/canvas.service"

export class Planet {
  public isAI = true;
  public velocity = 0;
  public direction = 0;
  public object: Phaser.Physics.Arcade.Sprite;

  private canvas = useCanvas();
  private diameter = this.canvas.getPercentageHeight(4);

  constructor(
    private scene: GameScene
  ) {
    const postion = this.getStartingPostion();
    this.object = this.scene.physics.add.sprite(postion.x, postion.y, "planet1");
    this.object.setOrigin(0.5, 0.5);
    this.object.body.setCircle(30);
    this.object.setScale(0.6);
    this.object.setData("planet", this);
  }

  public update() {
    this.updatePosition();
  }

  public move(direction: number) {
    this.direction = direction;
    this.velocity = Math.min(this.velocity + 4, 200);
  }

  public decelerate() {
    this.velocity = Math.max(0, this.velocity - 6);
  }

  public destroy() {
    console.log("DEATH!");
    this.object.destroy();
  }

  private getStartingPostion() {
    return {
      x: Phaser.Math.Between(this.canvas.getPercentageHeight(8), this.canvas.getPercentageHeight(50)),
      y: Phaser.Math.Between(this.canvas.getPercentageHeight(8), this.canvas.getPercentageHeight(50))
    }
  }

  private updatePosition() {
    this.object.body.velocity.set(this.velocity);
    this.object.body.velocity.setAngle(Phaser.Math.DegToRad(this.direction));
  }
}
