import { GameScene } from "../scenes/Game";
import { useCanvas } from "../services/canvas.service"

export class SolarSystem {
  public sunObject: Phaser.Physics.Arcade.Sprite;
  public diameter: number;

  private canvas = useCanvas();
  private orbitSpace;

  private shrinkTimer: Phaser.Time.TimerEvent;
  private shrinkTimerConfig: Phaser.Types.Time.TimerEventConfig;

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
    const sizeOfSun = 40;
    this.sunObject.body.setOffset((this.sunObject.body.width / 2) - sizeOfSun, (this.sunObject.body.width / 2) - sizeOfSun);
    this.sunObject.body.setCircle(sizeOfSun);

    this.shrinkTimerConfig = {
      callback: this.shrink,
      callbackScope: this,
      delay: 6*1000, // 1000 = 1 second
      loop: true
    };
    this.shrinkTimer = this.scene.time.addEvent(this.shrinkTimerConfig);
  }

  public get radius() : number {
    return this.diameter / 2;
  }  

  public reset() {
    this.diameter = this.canvas.getPercentageHeight(95);
    this.orbitSpace.setRadius(this.radius);

    this.shrinkTimer.reset(this.shrinkTimerConfig);
  }

  private shrink(ratio: number = 0.5) {
    if (this.diameter > this.sunObject.body.width) {
      this.diameter *= ratio;
      this.orbitSpace.setRadius(this.radius);
    }
  }
}
