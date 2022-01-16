import { GameScene } from "src/scenes/Game";
import { Planet } from "../models/planet.model";
import { useCanvas } from "./canvas.service";

export const usePlanetAi = (planet: Planet, game: GameScene) => {
  const { getCenter } = useCanvas();

  const getMoveDirection = () => {
    return evade();
  }

  const evade = () => {
    const center = getCenter();
    const playerPostion = game.playerPlanet.object.body.position;
    const playerAngleToPlanet = Phaser.Math.Angle.Between(playerPostion.x, playerPostion.y, center.x, center.y);
    const dis = game.solarSystem.diameter * 0.3;
    const target = {
      x: center.x + Math.cos(playerAngleToPlanet) * dis,
      y: center.y + Math.sin(playerAngleToPlanet) * dis,
    };

    return directionToTarget(target);
  };

  const directionToTarget = (target: { x: number, y: number }) => {
    const planetPosition = planet.object.body.position;
    return Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(planetPosition.x, planetPosition.y, target.x, target.y));
  }

  return {
    getMoveDirection,
  };
}
