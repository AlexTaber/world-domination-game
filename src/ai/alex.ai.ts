import { shuffle } from "lodash";
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
  private canvas = useCanvas();

  private state: AlexAIState;

  constructor(planet: Planet, game: GameScene) {
    super(planet, game);

    this.state = this.getDefaultState();
  }

  public getInput() {
    this.state.framesRemaining --;
    if (this.state.framesRemaining <= 0) {
      this.state.framesRemaining = this.getRandomDecisionTime();
      this.state.mode = Math.random() > 0.5 ? "attack" : "evade";
      this.state.data.target = undefined;
    }
    return {
      direction: this.state.mode === "attack" ? this.attack() : this.evade(),
      throttle: 0.85,
    };
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
    return (Math.random() > 0.5 ? "attack" : "evade") as AlexAIMode;
  }

  private getRandomDecisionTime() {
    return (this.game.physics.world.fps * 0.5) + ((this.game.physics.world.fps * 1.5) * Math.random());
  }

  private evade() {
    this.setTargetPlanet();
    const center = this.canvas.getCenter();
    const targetPosition = this.state.data.target!.object.body.position;
    const playerAngleToPlanet = Phaser.Math.Angle.Between(targetPosition.x, targetPosition.y, center.x, center.y);
    const dis = this.game.solarSystem.diameter * 0.25;
    const dir = playerAngleToPlanet + Phaser.Math.DegToRad(45);
    const target = {
      x: center.x + Math.cos(dir) * dis,
      y: center.y + Math.sin(dir) * dis,
    };

    return this.getDirectionToPoint(target);
  }

  private attack() {
    this.setTargetPlanet();
    const targetPosition = this.state.data.target!.object.body.position;
    return this.getDirectionToPoint(targetPosition);
  }

  private setTargetPlanet() {
    if (!this.state.data.target || this.state.data.target?.destroyed) {
      this.state.data.target = shuffle(this.game.planets).find(p => p.id !== this.planet.id && !p.destroyed);
    }
  }
}
