import { GameScene } from "../scenes/Game";
import { Planet } from "../models/planet.model";
import { useCanvas } from "./canvas.service";
import { shuffle } from "lodash";

interface AiState {
  mode: AiMode;
  data: AiData;
  framesRemaining: number;
}

type AiMode = "attack" | "evade";

interface AiData {
  target?: Planet;
}

export const usePlanetAi = (planet: Planet, game: GameScene) => {
  const { getCenter } = useCanvas();

  const getDefaultState = () => ({
    mode: getRandomMode(),
    data: {},
    framesRemaining: getRandomDecisionTime(),
  });

  const getRandomMode = () => (Math.random() > 0.5 ? "attack" : "evade") as AiMode;

  const getRandomDecisionTime = () => (game.physics.world.fps * 0.5) + ((game.physics.world.fps * 1.5) * Math.random());

  let state: AiState =  getDefaultState();

  const getMoveDirection = () => {
    state.framesRemaining --;
    if (state.framesRemaining <= 0) {
      state.framesRemaining = getRandomDecisionTime();
      state.mode = Math.random() > 0.5 ? "attack" : "evade";
      state.data.target = undefined;
    }
    return state.mode === "attack" ? attack() : evade();
  }

  const setTargetPlanet = () => {
    if (!state.data.target || state.data.target?.destroyed) {
      state.data.target = shuffle(game.planets).find(p => p.id !== planet.id && !p.destroyed);
    }
  }

  const evade = () => {
    setTargetPlanet();
    const center = getCenter();
    const targetPosition = state.data.target!.object.body.position;
    const playerAngleToPlanet = Phaser.Math.Angle.Between(targetPosition.x, targetPosition.y, center.x, center.y);
    const dis = game.solarSystem.diameter * 0.25;
    const dir = playerAngleToPlanet + Phaser.Math.DegToRad(30);
    const target = {
      x: center.x + Math.cos(dir) * dis,
      y: center.y + Math.sin(dir) * dis,
    };

    return directionToTarget(target);
  };

  const attack = () => {
    setTargetPlanet();
    const targetPosition = state.data.target!.object.body.position;
    return directionToTarget(targetPosition);
  }

  const directionToTarget = (target: { x: number, y: number }) => {
    const planetPosition = planet.object.body.position;
    return Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(planetPosition.x, planetPosition.y, target.x, target.y));
  }

  const reset = () => state = getDefaultState();

  return {
    getMoveDirection,
    reset,
  };
}
