import { getRandomPlanetName } from "../services/planet-name.generator";
import { GameScene } from "../scenes/Game";
import { AI, BaseAI } from "../ai/base.ai";

export interface PlanetOptions {
  name?: string;
  tint?: number;
  ai?: typeof BaseAI;
}

export interface PlanetInput {
  direction?: number;
  throttle: number;
}

export class Planet {
  public object: Phaser.Physics.Arcade.Sprite;
  public destroyed = false;
  public input: PlanetInput = { direction: undefined, throttle: 1 };
  public name;
  public emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  public tint: number;

  private maxVelocity = 1000;
  private nameLabel: Phaser.GameObjects.Text;
  private ai?: AI;

  constructor(
    public id: string,
    private scene: GameScene,
    private position: Phaser.Math.Vector2,
    options: PlanetOptions,
  ) {
    this.tint = options.tint || 0xff0000;
    this.name = options.name || getRandomPlanetName();

    this.emitter = this.scene.planetParticles.createEmitter({
      alpha: { start: 1, end: 0 },
      scale: 0.5,
      lifespan: 200,
      blendMode: 'ADD',
      tint: this.tint,
      frequency: 10,
    });

    this.object = this.scene.physics.add.sprite(
      this.position.x,
      this.position.y,
      "sun"
    );
    const size = 44;
    this.object.setOrigin(0.5, 0.5);
    this.object.body.setCircle(size);
    this.object.setScale(0.4);
    this.object.setData("planet", this);
    this.object.setBounce(1.4);
    this.object.setDrag(200);
    this.object.setAlpha(1);
    this.object.setTint(this.tint);
    this.object.body.setOffset(210, 210);
    this.object.setMass(1);
    this.setPosition(this.position.x, this.position.y);

    this.emitter.startFollow(this.object);

    this.nameLabel = this.scene.add.text(position.x, position.y, this.name);
    this.nameLabel.setOrigin(0.5);

    this.setAI(options.ai);
  }

  public setName(name: string) {
    this.name = name;
    this.nameLabel.text = name;
  }

  public setTint(tint: number) {
    this.tint = tint;
    this.emitter.setTint(tint);
    this.object.setTint(tint);
  }

  public update() {
    if (!this.destroyed && !this.scene.winnerId) {
      this.ai?.update();

      if (this.input.direction != undefined) {
        this.move(this.input);
      }
    }
  }

  public updateNamePosition() {
    this.nameLabel.setPosition(this.object.body.position.x + (this.object.body.width * 0.5), this.object.body.position.y - 20);
  }

  public move(input: PlanetInput) {
    const velocity = this.maxVelocity * input.throttle;
    this.object.setDrag(0);
    const x = Math.cos(Phaser.Math.DegToRad(input.direction!)) * velocity;
    const y = Math.sin(Phaser.Math.DegToRad(input.direction!)) * velocity;
    this.object.body.velocity.lerp(new Phaser.Math.Vector2(x, y), 0.03);
  }

  public setPosition(x: number, y: number) {
    this.object.setPosition(
      x + this.object.body.width / 2,
      y + this.object.body.height / 2
    );
  }

  public onGameOver() {
    this.ai?.reset();
  }

  public destroy() {
    this.destroyed = true;
    this.object.setPosition(-10000000);
    this.object.setVelocity(0);
  }

  private setAI(ai: typeof BaseAI | undefined) {
    if (ai) {
      this.ai = new ai(this, this.scene) as unknown as AI;
      this.setName(this.ai.name);
      this.object.setMass(0.8);
    }
  }
}
