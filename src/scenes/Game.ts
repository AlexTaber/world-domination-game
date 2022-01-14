import Phaser from 'phaser';
import { useCanvas } from '../services/canvas.service';
import { Planet } from '../models/planet.model';
import { SolarSystem } from '../models/solar-system.model';
import { GameInputService } from '../services/game-input.service';
import { usePeer } from '../services/peer.service';

export class GameScene extends Phaser.Scene {
  public solarSystem!: SolarSystem;
  public playerPlanet!: Planet;
  public winnerId?: string = undefined;

  private peer = usePeer();
  private canvas = useCanvas();
  private inputService?: GameInputService;
  private planets: Planet[] = [];
  private planetsMarkedForDestruction: Planet[] = [];

  constructor() {
    super('GameScene');
  }

  public preload() {
    this.load.image("planet1", "../assets/planet-1.png");
    this.load.image("sun", "../assets/sun.png");
    this.load.image("background", "../assets/background.jpg");
  }

  public create() {
    this.inputService = new GameInputService(this);
    this.setSolarSystem();
    this.createPlanets();
    this.setColliders();
    this.subscribeToStream();
    this.sendStartIfHost();
  }

  public update() {
    this.inputService?.update();
    if (this.peer.state.isHost) {
      this.handlePlanetsLeftOrbit();
      this.handleDestroyedPlanets();
    }
    this.sendUpdate();
  }

  public startNewGame() {
    this.winnerId = undefined;
    this.planets.forEach((p, i) => {
      const position = this.getPlanetInitialPosition(i);
      p.object.body.position.x = position.x;
      p.object.body.position.y = position.y;
      p.destroyed = false;
    });

    this.sendNewIfHost();
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
    const planet = new Planet(id, this, this.getPlanetInitialPosition(this.planets.length));
    this.planets.push(planet);
    return planet;
  }

  private getPlanetInitialPosition(index: number) {
    const dir = index * 135;
    const dis = this.solarSystem.diameter * 0.3;
    const center = this.canvas.getCenter();
    const x = center.x + Math.cos(Phaser.Math.DegToRad(dir)) * dis;
    const y = center.y + Math.sin(Phaser.Math.DegToRad(dir)) * dis;
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
      if (!p.destroyed && Phaser.Math.Distance.BetweenPoints(p.object.body.position, this.solarSystem.sunObject.body.position) > this.solarSystem.diameter / 2) {
        this.planetsMarkedForDestruction.push(p);
      }
    });
  }

  private sendStartIfHost() {
    if (this.peer.state.isHost) {
      this.peer.send("start", this.getPayload());
    }
  }

  private sendNewIfHost() {
    if (this.peer.state.isHost) {
      this.peer.send("new", this.getPayload());
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
        new: this.handleNewGameMessage.bind(this),
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

      if (planet) {
        if (!this.peer.state.isHost) {
          planet.setPosition(p.position.x, p.position.y);

          if (p.destroyed && !planet.destroyed) {
            this.destroyPlanet(planet!);
          } else if (planet.destroyed && !p.destroyed) {
            planet.destroyed = p.destroyed;
          }
        }

        planet?.object.setVelocity(p.velocity.x, p.velocity.y);
      }
    });
  }

  private handleGameOverMessage(data: any) {
    this.winnerId = data.winnerId;
  }

  private handleNewGameMessage(data: any) {
    this.winnerId = undefined;
    this.handleUpdateMessage(data);
  }

  private handleGameOverIfOnePlanetLeft = () => {
    const remainingPlanets = this.planets.filter(p => !p.destroyed);
    if (remainingPlanets.length === 1) {
      this.handleGameOver(remainingPlanets[0]);
    }
  };

  private handleGameOver(planet: Planet) {
    this.winnerId = planet.id;
    if (this.peer.state.isHost) {
      this.peer.send("gameOver", { winnerId: planet.id });
    }

    this.planets.forEach(p => p.object.setVelocity(0));
  }
}
