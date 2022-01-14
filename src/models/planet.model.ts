import { GameScene } from "../scenes/Game";

export class Planet {
  public isPlayer = false;
  public object: Phaser.Physics.Arcade.Sprite;
  public destroyed = false;

  constructor(
    public id: string,
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
    //
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
}
