import { GameScene } from "../scenes/Game";
import { usePeer } from "./peer.service";

export class GameInputService {
  private right: Phaser.Input.Keyboard.Key;
  private left: Phaser.Input.Keyboard.Key;
  private up: Phaser.Input.Keyboard.Key;
  private down: Phaser.Input.Keyboard.Key;
  private enter: Phaser.Input.Keyboard.Key;
  private peer = usePeer();

  constructor(
    private scene: GameScene
  ) {
    this.right = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.left = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.up = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.down = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.enter = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  public update() {
    if (!this.scene.playerPlanet.destroyed && !this.scene.winnerId) {
      let direction = undefined;
      if (this.right?.isDown) {
        if (this.up?.isDown) {
          direction = 315;
        } else if (this.down?.isDown) {
          direction = 45;
        } else {
          direction = 0;
        }
      } else if (this.left?.isDown) {
        if (this.up?.isDown) {
          direction = 225;
        } else if (this.down?.isDown) {
          direction = 135;
        } else {
          direction = 180;
        }
      } else if (this.up?.isDown) {
        direction = 270;
      } else if (this.down?.isDown) {
        direction = 90;
      }

      if (direction !== undefined) this.scene.playerPlanet.move(direction);
    }

    if (this.peer.state.isHost && this.enter.isDown && this.scene.winnerId) {
      this.scene.startNewGame();
    }
  }
}
