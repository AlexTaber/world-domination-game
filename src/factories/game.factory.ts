import { config } from "../config";
import { GameScene } from "../scenes/Game";

export const useGameFactory = () => {
  const createGame = () => {
    return new Phaser.Game(
      Object.assign(config, {
        scene: [GameScene]
      })
    );
  }

  return {
    createGame,
  };
}
