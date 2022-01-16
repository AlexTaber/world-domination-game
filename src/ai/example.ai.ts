import { Planet } from "../models/planet.model";
import { GameScene } from "../scenes/Game";
import { AI, BaseAI } from "./base.ai";

export class ExampleAI extends BaseAI implements AI {
  constructor(planet: Planet, game: GameScene) {
    super(planet, game);
  }

  public getInput() {
    // will slowly accelerate to the right. think you can do better :)
    return {
      direction: 0,
      throttle: 0.1,
    };
  }
}
