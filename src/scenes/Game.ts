import { usePlayerFormState } from "../services/player-form.service";
import Phaser from 'phaser';
import { useCanvas } from '../services/canvas.service';
import { Planet } from '../models/planet.model';
import { SolarSystem } from '../models/solar-system.model';
import { Asteroid } from '../models/asteroid.model';
import { GameInputService } from '../services/game-input.service';
import { usePeer } from '../services/peer.service';
import { usePublicGameState } from '../services/public-game-state.service';
import { useStats } from "../services/stats.service";

export class GameScene extends Phaser.Scene {
  public planetParticles!: Phaser.GameObjects.Particles.ParticleEmitterManager;
  public solarSystem!: SolarSystem;
  public playerPlanet!: Planet;
  public winnerId?: string = undefined;
  public planets: Planet[] = [];
  public astroids: Asteroid[] = [];

  private peer = usePeer();
  private canvas = useCanvas();
  private stats = useStats();
  private publicGameState = usePublicGameState();
  private playerFormStoreState = usePlayerFormState();
  private inputService?: GameInputService;
  private planetsMarkedForDestruction: Planet[] = [];

  constructor() {
    super("GameScene");
  }

  public preload() {
    this.load.image("planet1", "../assets/planet-1.png");
    this.load.image("sun", "../assets/sun.png");
    this.load.image("background", "../assets/background.jpg");
    this.load.image('asteroid', "/assets/asteroid.png");
    this.load.image('particleBlue', '/assets/particle-blue.png');
  }

  public create() {
    this.planetParticles = this.add.particles("particleBlue");
    this.inputService = new GameInputService(this);
    this.setSolarSystem();
    this.createPlanetsIfHost();
    // this.createAsteroids();
    this.setColliders();
    this.subscribeToStream();
    this.sendStartIfHost();
  }

  public update() {
    this.solarSystem.update();
    this.inputService?.update();
    this.updatePlanets();

    if (this.peer.state.isHost) {
      this.handlePlanetsLeftOrbit();
      this.handleDestroyedPlanets();
    }
    this.sendUpdate();
    this.updatePublicGameState();
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
    this.solarSystem.reset();
  }

  private setSolarSystem() {
    this.solarSystem = new SolarSystem(this);
  }

  private createPlanetsIfHost() {
    if (this.peer.state.isHost) {
      this.playerPlanet = this.createPlanet(this.peer.peer.id);
      this.playerPlanet.emitter.setTint(0x85c2ff);
      this.playerPlanet.object.setTint(0x85c2ff);
      this.playerPlanet.setName(this.playerFormStoreState.state.value.name);
      this.playerPlanet.isHost = true;

      this.peer.state.connections.forEach((conn) => {
        this.createPlanet(
          conn.peer,
        );
      });
    }
  }

  private createPlanet(id: string) {
    const planet = new Planet(
      id,
      this,
      this.getPlanetInitialPosition(this.planets.length)
    );
    this.planets.push(planet);
    this.stats.addPlanet(planet.id);
    return planet;
  }

  private createAsteroids() {
    const numberOfAsteriods = Math.floor((Math.random() * 4) + 1); // random number between 1-3

    for (let x = 0; x < numberOfAsteriods ; x++) {
      const astroid = new Asteroid(this,this.getPlanetInitialPosition(this.planets.length+numberOfAsteriods + x))
      this.astroids.push(astroid)
    }
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
   // this.physics.add.collider(this.planets.map(p => p.object), this.astroids.map(a => a.asteroid));
  }

  private onSunCollide(planetObject: Phaser.GameObjects.GameObject) {
    const planet = planetObject.getData("planet") as Planet;
    this.planetsMarkedForDestruction.push(planet);
  }

  private updatePlanets() {
    this.planets.forEach((p) => {
      if (this.peer.state.isHost) {
        p.update();
      }

      p.updateNamePosition();
    });
  }

  private handleDestroyedPlanets() {
    this.planetsMarkedForDestruction.forEach((p) => this.destroyPlanet(p));
    this.planetsMarkedForDestruction = [];
  }

  private handlePlanetsLeftOrbit() {
    this.planets.forEach((p) => {
      if (
        !p.destroyed &&
        Phaser.Math.Distance.BetweenPoints(
          p.object.body.position,
          this.solarSystem.sunObject.body.position
        ) >
          this.solarSystem.radius
      ) {
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
    return this.peer.state.isHost
      ? this.getHostPayload()
      : this.getConnectionPayload();
  };

  private getHostPayload = () => {
    return {
      planets: this.planets.map((p) => ({
        id: p.id,
        name: p.name,
        destroyed: p.destroyed,
        position: { x: p.object.body.position.x, y: p.object.body.position.y },
        velocity: { x: p.object.body.velocity.x, y: p.object.body.velocity.y },
      })),
    };
  };

  private getConnectionPayload = () => {
    return {
      planets: [
        {
          id: this.playerPlanet.id,
          name: this.playerPlanet.name,
          inputDirection: this.playerPlanet.inputDirection,
        },
      ],
    };
  };

  private subscribeToStream() {
    this.peer.stream.subscribe((message) => {
      const map = new Map(
        Object.entries({
          start: this.handleStartMessage.bind(this),
          update: this.handleUpdateMessage.bind(this),
          gameOver: this.handleGameOverMessage.bind(this),
          new: this.handleNewGameMessage.bind(this),
        })
      );

      map.get(message.type)?.(message.data);
    });
  }

  private handleStartMessage(data: any) {
    // create new planet instance with planet id
    data.planets.forEach((p: any, i: number) => {
      const planet = this.createPlanet(p.id);
      if (planet.id === this.peer.peer.id) {
        this.playerPlanet = planet;
        this.playerPlanet.emitter.setTint(0x85c2ff);
        this.playerPlanet.object.setTint(0x85c2ff);
        this.playerPlanet.setName(this.playerFormStoreState.state.value.name);
        planet.isHost = true;
      }
    });
    this.handleUpdateMessage(data);
  }

  private handleUpdateMessage(data: any) {
    data.planets.forEach((p: any, i: number) => {
      const planet = this.planets.find(
        (checkedPlanet) => checkedPlanet.id === p.id
      );

      if (planet) {
        if (!this.peer.state.isHost) {
          planet.setPosition(p.position.x, p.position.y);
          planet.object.setVelocity(p.velocity.x, p.velocity.y);

          if (planet.id !== this.playerPlanet.id) {
            planet.setName(p.name);
          }

          if (p.destroyed && !planet.destroyed) {
            this.destroyPlanet(planet!);
          } else if (planet.destroyed && !p.destroyed) {
            planet.destroyed = p.destroyed;
          }
        } else {
          planet.inputDirection = p.inputDirection;
          planet.setName(p.name);
        }
      }
    });
  }

  private handleGameOverMessage(data: any) {
    this.setWinnerId(data.winnerId);
  }

  private handleNewGameMessage(data: any) {
    this.winnerId = undefined;
    this.solarSystem.reset();
    this.handleUpdateMessage(data);
  }

  private handleGameOverIfOnePlanetLeft = () => {
    const remainingPlanets = this.planets.filter((p) => !p.destroyed);
    if (remainingPlanets.length === 1) {
      this.handleGameOver(remainingPlanets[0]);
    }
  };

  private handleGameOver(planet: Planet) {
    this.setWinnerId(planet.id);
    if (this.peer.state.isHost) {
      this.peer.send("gameOver", { winnerId: planet.id });
    }

    this.planets.forEach((p) => p.object.setVelocity(0));
  }

  private updatePublicGameState() {
    this.publicGameState.updateFromGame(this);
  }

  private setWinnerId(winnerId: string) {
    this.winnerId = winnerId;
    this.stats.incrementPlanetWins(winnerId);
  }
}
