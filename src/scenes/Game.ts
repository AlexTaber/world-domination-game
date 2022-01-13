import Phaser from 'phaser';
import { Planet } from '../models/planet.model';
import { SolarSystem } from '../models/solar-system.model';
import { GameInputService } from '../services/game-input.service';

export class GameScene extends Phaser.Scene {
  public solarSystem!: SolarSystem;
  public playerPlanet!: Planet;

  private inputService?: GameInputService;
  private planets: Planet[] = [];
  private planetsMarkedForDestruction: Planet[] = [];

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
    this.setColliders();
  }

  update() {
    this.inputService?.update();
    this.planets.forEach(planet => planet.update());
    this.handlePlanetsLeftOrbit();
    this.handleDestroyedPlanets();
  }

  private setSolarSystem() {
    this.solarSystem = new SolarSystem(this);
  }

  private setPlayerPlanet() {
    this.playerPlanet = this.createPlanet();
    this.playerPlanet.isAI = false;

    this.createPlanet();
    this.createPlanet();
    this.createPlanet();
  }

  private createPlanet() {
    const planet = new Planet(this, this.getPlanetInitialPosition());
    this.planets.push(planet);
    return planet;
  }

  private getPlanetInitialPosition() {
    const dir = this.planets.length * 135;
    const dis = this.solarSystem.diameter * 0.3;
    const x = this.solarSystem.sunObject.body.position.x + Math.cos(Phaser.Math.DegToRad(dir)) * dis;
    const y = this.solarSystem.sunObject.body.position.y + Math.sin(Phaser.Math.DegToRad(dir)) * dis;
    return new Phaser.Math.Vector2(x, y);
  }

  private destroyPlanet(planet: Planet) {
    this.planets = this.planets.filter(checkedPlanet => checkedPlanet !== planet);
    planet.destroy();
  }

  private setColliders() {
    this.physics.add.overlap(this.planets.map(p => p.object), this.solarSystem.sunObject, this.onSunCollide, undefined, this);
    this.physics.add.collider(this.planets.map(p => p.object), this.planets.map(p => p.object));
  }

  private onSunCollide(planetObject: Phaser.GameObjects.GameObject) {
    const planet = planetObject.getData("planet") as Planet;
    this.planetsMarkedForDestruction.push(planet);
    console.log(this.planetsMarkedForDestruction);
  }

  private handleDestroyedPlanets() {
    this.planetsMarkedForDestruction.forEach(p => this.destroyPlanet(p));
    this.planetsMarkedForDestruction = [];
  }

  private handlePlanetsLeftOrbit() {
    this.planets.forEach(p => {
      if (Phaser.Math.Distance.BetweenPoints(p.object.body.position, this.solarSystem.sunObject.body.position) > this.solarSystem.diameter / 2) {
        this.planetsMarkedForDestruction.push(p);
      }
    });
  }
}
