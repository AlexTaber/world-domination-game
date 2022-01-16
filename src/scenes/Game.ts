import { usePlayerFormState } from "../services/player-form.service";
import Phaser from 'phaser';
import { useCanvas } from '../services/canvas.service';
import { Planet, PlanetOptions } from '../models/planet.model';
import { SolarSystem } from '../models/solar-system.model';
import { Asteroid } from '../models/asteroid.model';
import { GameInputService } from '../services/game-input.service';
import { usePeer } from '../services/peer.service';
import { usePublicGameState } from '../services/public-game-state.service';
import { useStats } from "../services/stats.service";
import { useLobby } from "../services/lobby.service";
import { useAISelector } from "../services/ai.selector";

export class GameScene extends Phaser.Scene {
  public planetParticles!: Phaser.GameObjects.Particles.ParticleEmitterManager;
  public solarSystem!: SolarSystem;
  public playerPlanet?: Planet;
  public winnerId?: string = undefined;
  public planets: Planet[] = [];
  public astroids: Asteroid[] = [];

  private peer = usePeer();
  private canvas = useCanvas();
  private stats = useStats();
  private lobby = useLobby();
  private aiSelector = useAISelector();
  private publicGameState = usePublicGameState();
  private playerFormStoreState = usePlayerFormState();
  private inputService?: GameInputService;
  private planetsMarkedForDestruction: Planet[] = [];
  private newGameTimer?: Phaser.Time.TimerEvent;

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
      p.setPosition(position.x, position.y);
      p.destroyed = false;
    });

    this.sendNewIfHost();
    this.solarSystem.reset();
    this.newGameTimer?.destroy();
  }

  private setSolarSystem() {
    this.solarSystem = new SolarSystem(this);
  }

  private createPlanetsIfHost() {
    if (this.peer.state.isHost) {
      if (!this.lobby.state.value.aiOnly) {
        this.playerPlanet = this.createPlanet(this.peer.peer.id, { tint: 0x85c2ff });
        this.playerPlanet.setName(this.playerFormStoreState.state.value.name);
      }

      this.peer.state.connections.forEach((conn) => {
        this.createPlanet(
          conn.peer,
        );
      });

      Array.from({ length: this.lobby.state.value.aiBots }, (x, i) => {
        const aiPlanet = this.createPlanet(`ai${i + 1}`, { ai: this.aiSelector.getAI() });
      });
    }
  }

  private createPlanet(id: string, options: PlanetOptions = {}) {
    const planet = new Planet(
      id,
      this,
      this.getPlanetInitialPosition(this.planets.length),
      options,
    );
    this.planets.push(planet);
    this.stats.addPlanet(planet.id);
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
    if (!this.winnerId) {
      this.handleGameOverIfOnePlanetLeft();
    }
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
          id: this.playerPlanet!.id,
          name: this.playerPlanet!.name,
          input: this.playerPlanet!.input,
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
    data.planets.forEach((p: any, i: number) => {
      const planet = this.createPlanet(p.id);
      if (planet.id === this.peer.peer.id) {
        this.playerPlanet = planet;
        this.playerPlanet.setTint(0x85c2ff);
        this.playerPlanet.setName(this.playerFormStoreState.state.value.name);
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

          if (planet.id !== this.playerPlanet?.id) {
            planet.setName(p.name);
          }

          if (p.destroyed && !planet.destroyed) {
            this.destroyPlanet(planet!);
          } else if (planet.destroyed && !p.destroyed) {
            planet.destroyed = p.destroyed;
          }
        } else {
          planet.input = p.input;
          planet.setName(p.name);
        }
      }
    });
  }

  private handleGameOverMessage(data: any) {
    this.onGameOver(data.winnerId);
  }

  private handleNewGameMessage(data: any) {
    this.winnerId = undefined;
    this.solarSystem.reset();
    this.planets.forEach((p) => p.object.setVelocity(0));
    this.handleUpdateMessage(data);
  }

  private handleGameOverIfOnePlanetLeft = () => {
    const remainingPlanets = this.planets.filter((p) => !p.destroyed);
    if (remainingPlanets.length === 1) {
      this.onHostGameOver(remainingPlanets[0]);
    }
  };

  private onHostGameOver(planet: Planet) {
    this.onGameOver(planet.id);
    this.planets.forEach((p) => p.object.setVelocity(0));
    this.peer.send("gameOver", { winnerId: planet.id });
    this.newGameTimer = this.time.delayedCall(1200, () => this.startNewGame(), undefined, this);
  }

  private onGameOver(planetId: string) {
    this.setWinnerId(planetId);
    this.solarSystem.pauseShrink();
    this.planets.forEach(p => p.onGameOver());
  }

  private updatePublicGameState() {
    this.publicGameState.updateFromGame(this);
  }

  private setWinnerId(winnerId: string) {
    this.winnerId = winnerId;
    this.stats.incrementPlanetWins(winnerId);
  }
}
