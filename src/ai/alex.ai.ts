import { shuffle } from "lodash";
import { getRandomWeighted, WeightedRandomItem } from "../utils/random-utils";
import { Planet } from "../models/planet.model";
import { GameScene } from "../scenes/Game";
import { useCanvas } from "../services/canvas.service";
import { AI, BaseAI } from "./base.ai";

interface AlexAIState {
  mode: AlexAIMode;
  data: AlexAIData;
  framesRemaining: number;
}

type AlexAIMode = "attack" | "evade";

interface AlexAIData {
  target?: Planet;
}

export class AlexAI extends BaseAI implements AI {
  public name = "Alex AI";

  private canvas = useCanvas();

  private state: AlexAIState;

  private modeMap = new Map(
    Object.entries({
      attack: this.attack.bind(this),
      evade: this.evade.bind(this),
      mirror: this.mirror.bind(this),
    })
  );

  private weightedModes = [
    { value: "attack", weight: 0.45 },
    { value: "evade", weight: 0.3 },
    { value: "mirror", weight: 0.25 },
  ] as WeightedRandomItem<AlexAIMode>[];

  constructor(planet: Planet, game: GameScene) {
    super(planet, game);

    this.state = this.getDefaultState();
  }

  public update() {
    this.state.framesRemaining --;
    if (this.state.framesRemaining <= 0) {
      this.state.framesRemaining = this.getRandomDecisionTime();
      this.state.mode = this.getRandomMode();
      this.state.data.target = undefined;
    }

    this.planet.input = this.modeMap.get(this.state.mode)?.() || this.attack();
  }

  public reset() {
    this.state = this.getDefaultState();
  }

  private getDefaultState () {
    return {
      mode: this.getRandomMode(),
      data: {},
      framesRemaining: this.getRandomDecisionTime(),
    };
  }

  private getRandomMode() {
    return getRandomWeighted(this.weightedModes);
  }

  private getRandomDecisionTime() {
    return (this.game.physics.world.fps * 0.5) + ((this.game.physics.world.fps * 1.5) * Math.random());
  }

  private evade() {
    this.setTargetPlanet();
    const center = this.canvas.getCenter();
    const targetPosition = this.state.data.target!.object.body.position;
    const playerAngleToPlanet = Phaser.Math.Angle.Between(targetPosition.x, targetPosition.y, center.x, center.y);
    const dis = this.game.solarSystem.diameter * 0.2;
    const dir = playerAngleToPlanet;
    const target = {
      x: center.x + Math.cos(dir) * dis,
      y: center.y + Math.sin(dir) * dis,
    };

    return {
      direction: this.getDirectionToPoint(target),
      throttle: 0.85,
    };
  }

  private mirror() {
    this.setTargetPlanet();
    const center = this.canvas.getCenter();
    const targetPosition = this.state.data.target!.object.body.position;
    const playerAngleToPlanet = Phaser.Math.Angle.Between(targetPosition.x, targetPosition.y, center.x, center.y);
    const dis = this.game.solarSystem.diameter * 0.15;
    const dir = playerAngleToPlanet;
    const target = {
      x: center.x + Math.cos(dir) * dis,
      y: center.y - Math.sin(dir) * dis,
    };

    return {
      direction: this.getDirectionToPoint(target),
      throttle: 0.85,
    };
  }

  private attack() {
    this.setTargetPlanet();
    const targetPosition = this.state.data.target!.object.body.position;
    return {
      direction: this.getDirectionToPoint(targetPosition),
      throttle: 1,
    };
  }

  private setTargetPlanet() {
    if (!this.state.data.target || this.state.data.target?.destroyed) {
      this.state.data.target = shuffle(this.game.planets).find(p => p.id !== this.planet.id && !p.destroyed);
    }
  }
}
