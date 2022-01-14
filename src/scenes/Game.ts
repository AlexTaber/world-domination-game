import Phaser from 'phaser';
import { Planet } from '../models/planet.model';
import { SolarSystem } from '../models/solar-system.model';
import { GameInputService } from '../services/game-input.service';
import { usePeer } from '../services/peer.service';

export class GameScene extends Phaser.Scene {
  public solarSystem!: SolarSystem;
  public playerPlanet!: Planet;

  private peer = usePeer();
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
    this.createPlanets();
    this.setColliders();
    this.subscribeToStream();
    this.sendStart();
  }

  update() {
    this.inputService?.update();
    this.planets.forEach(planet => planet.update());
    this.handlePlanetsLeftOrbit();
    this.handleDestroyedPlanets();
    this.sendUpdate();
  }

  private setSolarSystem() {
    this.solarSystem = new SolarSystem(this);
  }

  private createPlanets() {
    if (this.peer.state.isHost) {
      this.playerPlanet = this.createPlanet(this.peer.peer.id);
      this.playerPlanet.isPlayer = true;

      this.peer.state.connections.forEach(conn => {
        this.createPlanet(conn.peer)
      })
    }
  }

  private createPlanet(id: string) {
    const planet = new Planet(id, this, this.getPlanetInitialPosition());
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

  private sendStart() {
    this.peer.sendIfHost("start", this.getPayload());
  }

  private sendUpdate() {
    this.peer.sendIfHost("update", this.getPayload());
  }

  private getPayload = () => {
    return {
      planets: this.planets.map(p => ({
        id: p.id,
        position: { x: p.object.body.position.x, y: p.object.body.position.y },
        velocity: { x: p.object.body.velocity.x, y: p.object.body.velocity.y },
      })),
    };
  }

  private subscribeToStream() {
    this.peer.stream.subscribe(message => {
      const map = new Map(Object.entries({
        start: this.handleStartMessage.bind(this),
        update: this.handleUpdateMessage.bind(this),
      }));

      map.get(message.type)?.(message.data);
    });
  }

  private handleStartMessage(data: any) {
    data.planets.forEach((p: any, i: number) => {
      const planet = this.createPlanet(p.id);
      if (planet.id === this.peer.peer.id) {
        this.playerPlanet = planet;
        planet.isPlayer = true;
      }
    });
    this.handleUpdateMessage(data);
  }

  private handleUpdateMessage(data: any) {
    data.planets.forEach((p: any, i: number) => {
      const planet = this.planets.find(checkedPlanet => checkedPlanet.id === p.id);
      planet?.object.setPosition(p.position.x, p.position.y);
      planet?.object.setVelocity(p.velocity.x, p.velocity.y);
    });
  }
}
