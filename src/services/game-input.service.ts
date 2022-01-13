import { GameScene } from "../scenes/Game";

export class GameInputService {
  private right: Phaser.Input.Keyboard.Key;
  private left: Phaser.Input.Keyboard.Key;
  private up: Phaser.Input.Keyboard.Key;
  private down: Phaser.Input.Keyboard.Key;

  constructor(
    private scene: GameScene
  ) {
    this.right = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.left = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.up = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.down = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
  }

  public update() {
    if (this.right?.isDown) {
      this.scene.playerPlanet?.move(0);
    } else if (this.left?.isDown) {
      this.scene.playerPlanet?.move(180);
    } else if (this.up?.isDown) {
      this.scene.playerPlanet?.move(270);
    } else if (this.down?.isDown) {
      this.scene.playerPlanet?.move(90);
    } else {
      this.scene.playerPlanet?.decelerate();
    }
  }
}
