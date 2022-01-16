import { Planet } from "../models/planet.model";
import { GameScene } from "../scenes/Game";
import { usePeer } from "./peer.service";
import { usePlayerFormState } from "./player-form.service";

export const useGamePeer = (game: GameScene) => {
  const {
    state: peerState,
    peer,
    stream,
    send,
  } = usePeer();

  const { state: formState } = usePlayerFormState();

  const subscribe = () => {
    stream.subscribe((message) => {
      const map = new Map(
        Object.entries({
          start: handleStartMessage,
          update: handleUpdateMessage,
          gameOver: handleGameOverMessage,
          new: handleNewGameMessage,
        })
      );

      map.get(message.type)?.(message.data);
    });
  }

  const sendStartIfHost = () => {
    if (peerState.isHost) {
      send("start", getPayload());
    }
  };

  const sendNew = () => send("new", getPayload());

  const sendUpdate = () => send("update", getPayload());

  const sendGameOver = (planet: Planet) => send("gameOver", { winnerId: planet.id });

  const getPayload = () => {
    return peerState.isHost
      ? getHostPayload()
      : getConnectionPayload();
  };

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

  const getConnectionPayload = () => {
    return {
      planets: [
        {
          id: game.playerPlanet!.id,
          name: game.playerPlanet!.name,
          input: game.playerPlanet!.input,
        },
      ],
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

    handleUpdateMessage(data);
  }

  const handleUpdateMessage = (data: any) => {
    data.planets.forEach((p: any, i: number) => {
      const planet = game.planets.find(
        (checkedPlanet) => checkedPlanet.id === p.id
      );

      if (planet) {
        if (!peerState.isHost) {
          planet.setPosition(p.position.x, p.position.y);
          planet.object.setVelocity(p.velocity.x, p.velocity.y);

          if (planet.id !== game.playerPlanet?.id) {
            planet.setName(p.name);
          }

          if (p.destroyed && !planet.destroyed) {
            planet!.destroy();
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

  const handleGameOverMessage = (data: any) => {
    game.onGameOver(data.winnerId);
  }

  const handleNewGameMessage = (data: any) => {
    game.winnerId = undefined;
    game.solarSystem.reset();
    game.planets.forEach((p) => p.object.setVelocity(0));
    handleUpdateMessage(data);
  }
  
  return {
    peerId: peer.id,
    isHost: peerState.isHost,
    connections: peerState.connections,
    subscribe,
    sendStartIfHost,
    sendNew,
    sendUpdate,
    sendGameOver,
  };
}
