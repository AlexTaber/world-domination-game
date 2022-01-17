import { usePlayerFormState } from "../services/player-form.service";
import Phaser from 'phaser';
import { useCanvas } from '../services/canvas.service';
import { Planet, PlanetOptions } from '../models/planet.model';
import { SolarSystem } from '../models/solar-system.model';
import { Asteroid } from '../models/asteroid.model';
import { GameInputService } from '../services/game-input.service';
import { usePublicGameState } from '../services/public-game-state.service';
import { useStats } from "../services/stats.service";
import { useLobby } from "../services/lobby.service";
import { useAISelector } from "../services/ai.selector";
import { useGamePeer } from "../services/game-peer.service";

export class GameScene extends Phaser.Scene {
  public planetParticles!: Phaser.GameObjects.Particles.ParticleEmitterManager;
  public solarSystem!: SolarSystem;
  public playerPlanet?: Planet;
  public winnerId?: string = undefined;
  public planets: Planet[] = [];
  public astroids: Asteroid[] = [];

  private gamePeer = useGamePeer(this);
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
    this.gamePeer.subscribe();
    this.gamePeer.sendStartIfHost();
  }

  public update() {
    this.solarSystem.update();
    this.inputService?.update();
    this.updatePlanets();

    if (this.gamePeer.isHost) {
      this.handlePlanetsLeftOrbit();
      this.handleDestroyedPlanets();
    }

    this.gamePeer.sendUpdate();
    this.updatePublicGameState();
  }

  public hostStartNewGame() {
    this.winnerId = undefined;
    this.planets.forEach((p, i) => {
      const position = this.getPlanetInitialPosition(i);
      p.object.body.position.x = position.x;
      p.object.body.position.y = position.y;
      p.setPosition(position.x, position.y);
      p.destroyed = false;
    });

    this.gamePeer.sendNew();
    this.solarSystem.reset();
    this.newGameTimer?.destroy();
  }

  public createPlanet(id: string, options: PlanetOptions = {}) {
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

  public onGameOver(planetId: string) {
    this.setWinnerId(planetId);
    this.solarSystem.pauseShrink();
    this.planets.forEach(p => p.onGameOver());
  }

  public removePlanet(id: string) {
    const planet = this.planets.find(p => p.id === id);
    if (planet) {
      this.planets.splice(this.planets.findIndex(p => p.id === id, 1));
      planet.clean();
    }
  }

  public close() {
    window.location.href = "/";
  }

  private setSolarSystem() {
    this.solarSystem = new SolarSystem(this);
  }

  private createPlanetsIfHost() {
    if (this.gamePeer.isHost) {
      if (!this.lobby.state.value.aiOnly) {
        this.playerPlanet = this.createPlanet(this.gamePeer.peerId, {
          tint: 0x85c2ff,
          name: this.playerFormStoreState.state.value.name
        });
      }

      this.gamePeer.connections.forEach((conn) => {
        this.createPlanet(
          conn.peer,
        );
      });

      Array.from({ length: this.lobby.state.value.aiBots }, (x, i) => {
        const aiPlanet = this.createPlanet(`ai${i + 1}`, { ai: this.aiSelector.getAI() });
      });
    }
  }

  private getPlanetInitialPosition(index: number) {
    const dir = index * 135;
    const dis = this.solarSystem.maxDiameter * 0.3;
    const center = this.canvas.getCenter();
    const x = center.x + Math.cos(Phaser.Math.DegToRad(dir)) * dis;
    const y = center.y + Math.sin(Phaser.Math.DegToRad(dir)) * dis;
    return new Phaser.Math.Vector2(x, y);
  }

  private setColliders() {
    // this.physics.add.overlap(this.planets.map(p => p.object), this.solarSystem.sunObject, this.onSunCollide, undefined, this);
    this.physics.add.collider(this.planets.map(p => p.object), this.planets.map(p => p.object));
  }

  private onSunCollide(planetObject: Phaser.GameObjects.GameObject) {
    const planet = planetObject.getData("planet") as Planet;
    this.planetsMarkedForDestruction.push(planet);
  }

  private updatePlanets() {
    this.planets.forEach((p) => {
      if (this.gamePeer.isHost) {
        p.update();
      }

      p.updateNamePosition();
    });
  }

  private handleDestroyedPlanets() {
    this.planetsMarkedForDestruction.forEach((p) => p.destroy());
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

  private handleGameOverIfOnePlanetLeft = () => {
    const remainingPlanets = this.planets.filter((p) => !p.destroyed);
    if (remainingPlanets.length === 1) {
      this.onHostGameOver(remainingPlanets[0]);
    }
  };

  private onHostGameOver(planet: Planet) {
    this.onGameOver(planet.id);
    this.planets.forEach((p) => p.object.setVelocity(0));
    this.gamePeer.sendGameOver(planet);
    this.newGameTimer = this.time.delayedCall(
      1200,
      () => this.planets.length > 1 ? this.hostStartNewGame() : this.close(),
      undefined,
      this
    );
  }

  private updatePublicGameState() {
    this.publicGameState.updateFromGame(this);
  }

  private setWinnerId(winnerId: string) {
    this.winnerId = winnerId;
    this.stats.incrementPlanetWins(winnerId);
  }
}
