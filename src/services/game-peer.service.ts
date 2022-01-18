import { Subscription } from "rxjs";
import { Planet } from "../models/planet.model";
import { GameScene } from "../scenes/Game";
import { diff } from "../utils/diff";
import { usePeer } from "./peer.service";
import { usePlayerFormState } from "./player-form.service";
import { PlanetStats, useStats } from "./stats.service";

export const useGamePeer = (game: GameScene) => {
  const {
    state: peerState,
    peer,
    stream,
    send,
  } = usePeer();

  const { state: formState } = usePlayerFormState();

  const { updatePlanetStats } = useStats();

  let prevGuestPayload: any = {};
  let sub: Subscription | undefined;

  const subscribe = () => {
    sub = stream.subscribe((message) => {
      const map = new Map(
        Object.entries({
          start: handleStartMessage,
          hostUpdate: handleHostUpdateMessage,
          guestUpdate: handleGuestUpdateMessage,
          gameOver: handleGameOverMessage,
          new: handleNewGameMessage,
          disconnection: handleDisconnection,
          close: handleClose,
          updateStats: handleUpdateStats,
        })
      );

      map.get(message.type)?.(message.data);
    });
  }

  const unsubscribe = () => sub?.unsubscribe();

  const sendStartIfHost = () => {
    if (peerState.isHost) {
      send("start", getHostPayload());
    }
  };

  const sendNew = () => send("new", getHostPayload());

  const sendUpdate = () => peerState.isHost ? sendHostUpdate() : sendGuestUpdate();

  const sendGameOver = (planet: Planet) => send("gameOver", { winnerId: planet.id });

  const sendHostUpdate = () => send("hostUpdate", getHostPayload());

  const sendUpdateStats = (id: string, diff: Partial<PlanetStats>) => send("updateStats", { id, diff });

  const getHostPayload = () => {
    return {
      planets: game.planets.map((p) => ({
        id: p.id,
        name: p.name,
        destroyed: p.destroyed,
        position: { x: p.object.body.position.x, y: p.object.body.position.y },
        velocity: { x: p.object.body.velocity.x, y: p.object.body.velocity.y },
      })),
    };
  };

  const sendGuestUpdate = () => {
    const fullPayload = getGuestPayload();
    const payloadDiff = diff(fullPayload, prevGuestPayload);
    const payload = payloadDiff.reduce(
      (payload, key) => ({
        ...payload,
        [key]: fullPayload[key as keyof typeof fullPayload],
      }),
      {} as any
    );

    if (Object.keys(payload).length > 0) {
      send("guestUpdate", { id: game.playerPlanet!.id, ...payload });
    }

    prevGuestPayload = fullPayload;
  }

  const getGuestPayload = () => {
    return {
      id: game.playerPlanet!.id,
      name: game.playerPlanet!.name,
      input: game.playerPlanet!.input,
    };
  };

  const handleStartMessage = (data: any) => {
    data.planets.forEach((p: any, i: number) => {
      const planet = game.createPlanet(p.id);
      if (planet.id === peer.id) {
        game.playerPlanet = planet;
        game.playerPlanet.setTint(0x85c2ff);
        game.playerPlanet.setName(formState.value.name);
      }
    });

    handleGuestUpdateMessage(data);
  }

  const handleHostUpdateMessage = (data: any) => {
    data.planets.forEach((p: any, i: number) => {
      const planet = game.planets.find(
        (checkedPlanet) => checkedPlanet.id === p.id
      );

      if (planet) {
        planet.setPosition(p.position.x, p.position.y);
        planet.object.setVelocity(p.velocity.x, p.velocity.y);

        if (planet.id !== game.playerPlanet?.id) {
          planet.setName(p.name);
        }

        if (p.destroyed && !planet.destroyed) {
          game.destroyPlanet(planet);
        } else if (planet.destroyed && !p.destroyed) {
          planet.destroyed = p.destroyed;
        }
      }
    });
  }

  const handleGuestUpdateMessage = (data: any) => {
    const planet = game.planets.find(
      (checkedPlanet) => checkedPlanet.id === data.id
    );

    if (planet) {
      if (data.name) planet.setName(data.name);
      if (data.input) planet.input = data.input;
    }
  }

  const handleGameOverMessage = (data: any) => {
    game.onGameOver(data.winnerId);
  }

  const handleNewGameMessage = (data: any) => {
    game.winnerId = undefined;
    game.solarSystem.reset();
    game.planets.forEach((p) => p.object.setVelocity(0));
    prevGuestPayload = {};
    handleGuestUpdateMessage(data);
  }

  const handleDisconnection = (peerId: string) => {
    game.removePlanet(peerId);

    if (peerState.isHost) {
      send("disconnection", peerId);
    }
  }

  const handleClose = () => {
    if (!peerState.isHost) {
      game.close();
    }
  }

  const handleUpdateStats = (data: any) => {
    updatePlanetStats(data.id, data.diff);
  }

  return {
    peerId: peer.id,
    isHost: peerState.isHost,
    connections: peerState.connections,
    subscribe,
    unsubscribe,
    sendStartIfHost,
    sendNew,
    sendUpdate,
    sendGameOver,
    sendUpdateStats,
  };
}
