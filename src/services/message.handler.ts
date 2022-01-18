import { Subscription } from "rxjs";
import { GameScene } from "../scenes/Game";
import { useMessageSender } from "./message.sender";
import { usePeer } from "./peer.service";
import { usePlayerFormState } from "./player-form.service";
import { useStats } from "./stats.service";

export const useMessageHandler = (game: GameScene) => {
  const {
    state: peerState,
    peer,
    stream,
    send,
  } = usePeer();

  const { state: formState } = usePlayerFormState();

  const { updatePlanetStats } = useStats();

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
    // prevGuestPayload = {};
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
    subscribe,
    unsubscribe,
  };
}
