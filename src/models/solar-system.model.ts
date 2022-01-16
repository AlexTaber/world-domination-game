import { GameScene } from "../scenes/Game";
import { useCanvas } from "../services/canvas.service"

export class SolarSystem {
  public sunObject!: Phaser.Physics.Arcade.Sprite;
  public diameter: number;

  private canvas = useCanvas();
  private orbitSpace;

  private shrinkTimer: Phaser.Time.TimerEvent;
  private shrinkTimerConfig: Phaser.Types.Time.TimerEventConfig;
  private isShrinking = false;

  constructor(
    private scene: GameScene
  ) {
    const position = this.canvas.getCenter();
    this.diameter = this.canvas.getPercentageHeight(95);

    this.orbitSpace = this.scene.add.circle(position.x, position.y, this.radius, 0xffffff, 0.06);

    this.setSun(position);

    this.shrinkTimerConfig = {
      callback: () => this.isShrinking = true,
      callbackScope: this,
      delay: 2000,
    };
    this.shrinkTimer = this.scene.time.addEvent(this.shrinkTimerConfig);
  }

  public get radius() : number {
    return this.diameter / 2;
  }

  public update() {
    if (this.isShrinking) {
      this.shrink();
    }
  }

  public pauseShrink() {
    this.isShrinking = false;
  }

  public reset() {
    this.diameter = this.canvas.getPercentageHeight(95);
    this.orbitSpace.setRadius(this.radius);
    this.isShrinking = false;

    this.shrinkTimer.destroy();
    this.shrinkTimer = this.scene.time.addEvent(this.shrinkTimerConfig);
  }

  private setSun(position: { x: number, y: number }) {
    this.sunObject = this.scene.physics.add.sprite(position.x, position.y, "sun");
    this.sunObject.setScale(0.7);
    this.sunObject.setOrigin(0.5, 0.5);
    const sizeOfSun = 40;
    this.sunObject.body.setOffset((this.sunObject.body.width / 2) - sizeOfSun, (this.sunObject.body.width / 2) - sizeOfSun);
    this.sunObject.body.setCircle(sizeOfSun);
  }

  private shrink(ratio: number = 0.9995) {
    this.diameter *= ratio;
    this.orbitSpace.setRadius(this.radius);
  }
}
