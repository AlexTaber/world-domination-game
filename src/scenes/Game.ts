import Phaser from 'phaser';
import { Planet } from '../models/planet.model';
import { SolarSystem } from '../models/solar-system.model';
import { GameInputService } from '../services/game-input.service';

export class GameScene extends Phaser.Scene {
  public solarSystem!: SolarSystem;
  public playerPlanet!: Planet;

  private inputService?: GameInputService;
  private planets: Planet[] = [];

  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image("planet1", "assets/planet-1.png");
  }

  create() {
    this.inputService = new GameInputService(this);
    this.setSolarSystem();
    this.setPlayerPlanet();
    this.setCollider();
  }

  update() {
    this.inputService?.update();
    this.planets.forEach(planet => planet.update());
  }

  private setSolarSystem() {
    this.solarSystem = new SolarSystem(this);
  }

  private setPlayerPlanet() {
    this.playerPlanet = this.createPlanet();
    this.playerPlanet.isAI = false;
  }

  private createPlanet() {
    const planet = new Planet(this);
    this.planets.push(planet);
    return planet;
  }

  private destroyPlanet(planet: Planet) {
    this.planets = this.planets.filter(checkedPlanet => checkedPlanet !== planet);
    planet.destroy();
  }

  private setCollider() {
    this.physics.add.overlap(this.playerPlanet.object, this.solarSystem.sunObject, this.onCollide, undefined, this);
  }

  private onCollide(planetObject: Phaser.GameObjects.GameObject) {
    const planet = planetObject.getData("planet") as Planet;
    this.destroyPlanet(planet);
  }
}
