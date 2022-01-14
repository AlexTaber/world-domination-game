import { GameScene } from "../scenes/Game";

export class Planet {
  public isHost = false;
  public object: Phaser.Physics.Arcade.Sprite;
  public destroyed = false;
  public inputDirection?: number = undefined;
  public name = "apples";
  public image = "bananas";

  private nameLabel: Phaser.GameObjects.Text;

  constructor(
    public id: string,
    private scene: GameScene,
    private position: Phaser.Math.Vector2
  ) {
    this.object = this.scene.physics.add.sprite(
      this.position.x,
      this.position.y,
      "planet1"
    );
    this.object.setOrigin(0.5, 0.5);
    this.object.body.setCircle(30);
    this.object.setScale(0.6);
    this.object.setData("planet", this);
    this.object.setBounce(1.2);
    this.object.setDrag(200);
    this.setPosition(this.position.x, this.position.y);

    this.nameLabel = this.scene.add.text(position.x, position.y, this.name);
  }

  public setName(name: string) {
    this.name = name;
    this.nameLabel.text = name;
  }

  public update() {
    if (this.inputDirection != undefined && !this.destroyed)
      this.move(this.inputDirection);
  }

  public updateNamePosition() {
    this.nameLabel.setPosition(this.object.body.position.x, this.object.body.position.y - 20);
  }

  public move(direction: number) {
    this.object.setDrag(0);
    const x = Math.cos(Phaser.Math.DegToRad(direction)) * 800;
    const y = Math.sin(Phaser.Math.DegToRad(direction)) * 800;
    this.object.body.velocity.lerp(new Phaser.Math.Vector2(x, y), 0.035);
  }

  public setPosition(x: number, y: number) {
    this.object.setPosition(
      x + this.object.body.width / 2,
      y + this.object.body.height / 2
    );
  }

  public destroy() {
    this.destroyed = true;
    this.object.setPosition(-10000000);
    this.object.setVelocity(0);
    console.log("DEATH");
  }


}
