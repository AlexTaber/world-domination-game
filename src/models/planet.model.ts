import { getRandomPlanetName } from "../services/planet-name.generator";
import { GameScene } from "../scenes/Game";
import { AI } from "../ai/base.ai";
import { AlexAI } from "../ai/alex.ai";

export class Planet {
  public isAi = false;
  public isHost = false;
  public object: Phaser.Physics.Arcade.Sprite;
  public destroyed = false;
  public inputDirection?: number = undefined;
  public throttle = 1;
  public name = getRandomPlanetName();
  public image = "bananas";
  public emitter: Phaser.GameObjects.Particles.ParticleEmitter;

  private maxVelocity = 1000;
  private nameLabel: Phaser.GameObjects.Text;
  private ai: AI;

  constructor(
    public id: string,
    private scene: GameScene,
    private position: Phaser.Math.Vector2
  ) {
    this.ai = new AlexAI(this, this.scene);

    this.emitter = this.scene.planetParticles.createEmitter({
      alpha: { start: 1, end: 0 },
      scale: 0.5,
      lifespan: 200,
      blendMode: 'ADD',
      tint: 0xFF0000,
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
    this.object.setTint(0xff0000);
    this.object.body.setOffset(210, 210);
    this.object.setMass(1);
    this.setPosition(this.position.x, this.position.y);

    this.emitter.startFollow(this.object);

    this.nameLabel = this.scene.add.text(position.x, position.y, this.name);
    this.nameLabel.setOrigin(0.5);
  }

  public setName(name: string) {
    this.name = name;
    this.nameLabel.text = name;
  }

  public setIsAi() {
    this.isAi = true;
    this.object.setMass(0.8);
  }

  public update() {
    if (!this.destroyed && !this.scene.winnerId) {
      if (this.isAi) {
        const input = this.ai.getInput();
        this.inputDirection = input.direction;
        this.throttle = input.throttle;
      }

      if (this.inputDirection != undefined) {
        this.move(this.inputDirection, this.throttle);
      }
    }
  }

  public updateNamePosition() {
    this.nameLabel.setPosition(this.object.body.position.x + (this.object.body.width * 0.5), this.object.body.position.y - 20);
  }

  public move(direction: number, throttle: number) {
    const velocity = this.maxVelocity * throttle;
    this.object.setDrag(0);
    const x = Math.cos(Phaser.Math.DegToRad(direction)) * velocity;
    const y = Math.sin(Phaser.Math.DegToRad(direction)) * velocity;
    this.object.body.velocity.lerp(new Phaser.Math.Vector2(x, y), this.isAi ? 0.035 : 0.03);
  }

  public setPosition(x: number, y: number) {
    this.object.setPosition(
      x + this.object.body.width / 2,
      y + this.object.body.height / 2
    );
  }

  public onGameOver() {
    if (this.isAi) this.ai.reset();
  }

  public destroy() {
    this.destroyed = true;
    this.object.setPosition(-10000000);
    this.object.setVelocity(0);
    console.log("DEATH");
  }
}
