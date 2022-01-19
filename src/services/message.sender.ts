import { Planet } from "../models/planet.model";
import { GameScene } from "../scenes/Game";
import { diff } from "../utils/diff";
import { usePeer } from "./peer.service";

export const useMessageSender = (game: GameScene) => {
  const {
    state: peerState,
    peer,
    send,
  } = usePeer();

  let prevGuestPayload: any = {};

  const sendStartIfHost = () => {
    if (peerState.isHost) {
      send("start", getHostPayload());
    }
  };

  const sendNew = () => send("new", getHostPayload());

  const sendUpdate = () => peerState.isHost ? sendHostUpdate() : sendGuestUpdate();

  const sendGameOver = (planetId?: string) => send("gameOver", { winnerId: planetId });

  const sendHostUpdate = () => send("hostUpdate", getHostPayload());

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

  const resetPrevGuestPayload = () => prevGuestPayload = undefined;

  return {
    peerId: peer.id,
    isHost: peerState.isHost,
    connections: peerState.connections,
    sendStartIfHost,
    sendNew,
    sendUpdate,
    sendGameOver,
    resetPrevGuestPayload,
  };
}
