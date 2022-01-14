import Phaser from 'phaser';
import { Planet } from '../models/planet.model';
import { SolarSystem } from '../models/solar-system.model';
import { GameInputService } from '../services/game-input.service';
import { usePeer } from '../services/peer.service';

export class GameScene extends Phaser.Scene {
  public solarSystem!: SolarSystem;
  public playerPlanet!: Planet;
  public winnerId = undefined;

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
    if (this.peer.state.isHost) {
      this.handlePlanetsLeftOrbit();
      this.handleDestroyedPlanets();
    }
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
    planet.destroy();
    this.handleGameOverIfOnePlanetLeft();
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
    if (this.peer.state.isHost) {
      this.peer.send("start", this.getPayload());
    }
  }

  private sendUpdate() {
    this.peer.send("update", this.getPayload());
  }

  private getPayload = () => {
    return this.peer.state.isHost ? this.getHostPayload() : this.getConnectionPayload();
  }

  private getHostPayload = () => {
    return {
      planets: this.planets.map(p => ({
        id: p.id,
        destroyed: p.destroyed,
        position: { x: p.object.body.position.x, y: p.object.body.position.y },
        velocity: { x: p.object.body.velocity.x, y: p.object.body.velocity.y },
      })),
    };
  }

  private getConnectionPayload = () => {
    return {
      planets: [
        {
          id: this.playerPlanet.id,
          velocity: { x: this.playerPlanet.object.body.velocity.x, y: this.playerPlanet.object.body.velocity.y },
        }
      ]
    }
  };

  private subscribeToStream() {
    this.peer.stream.subscribe(message => {
      const map = new Map(Object.entries({
        start: this.handleStartMessage.bind(this),
        update: this.handleUpdateMessage.bind(this),
        gameOver: this.handleGameOverMessage.bind(this),
      }));

      map.get(message.type)?.(message.data);
    });
  }

  private handleStartMessage(data: any) {
    this.winnerId = undefined;
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

      if (!this.peer.state.isHost) {
        planet?.object.setPosition(p.position.x, p.position.y);

        if (p.destroyed && !planet?.destroyed) {
          this.destroyPlanet(planet!);
        }
      }

      planet?.object.setVelocity(p.velocity.x, p.velocity.y);
    });
  }

  private handleGameOverMessage(data: any) {
    this.winnerId = data.winnerId;
  }

  private handleGameOverIfOnePlanetLeft = () => {
    const remainingPlanets = this.planets.filter(p => !p.destroyed);
    if (remainingPlanets.length === 1) {
      this.handleGameOver(remainingPlanets[0]);
    }
  };

  private handleGameOver(planet: Planet) {
    if (this.peer.state.isHost) {
      this.peer.send("gameOver", { winnerId: planet.id });
    }

    this.planets.forEach(p => p.object.setVelocity(0));
  }
}
