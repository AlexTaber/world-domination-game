import { GameScene } from "../scenes/Game";

export class Asteroid {
  public asteroid: Phaser.Physics.Arcade.Sprite;

  constructor(
    private scene: GameScene,
    private position: Phaser.Math.Vector2,
  ) {

    const asteroidSize = 40
    this.asteroid = this.scene.physics.add.sprite(position.x + 250, position.y + 150, "asteroid");
    this.asteroid.setScale(0.1);
    this.asteroid.setOrigin(0.5, 0.5);
    this.asteroid.body.setOffset((this.asteroid.body.width / 2) - asteroidSize, (this.asteroid.body.width / 2) - asteroidSize);
    this.asteroid.body.setCircle(asteroidSize);
    this.asteroid.setBounce(1.2);
    this.setPosition(this.position.x, this.position.y);
  }

  public setPosition(x: number, y: number) {
    this.asteroid.setPosition(x + (this.asteroid.body.width / 2), y + (this.asteroid.body.height / 2));
  }

}
