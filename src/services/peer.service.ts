import Peer, { DataConnection } from "peerjs";

import { ReplaySubject } from "rxjs";
import { useGameFactory } from "../factories/game.factory";

type MessageType = "connection" | "start" | "update" | "gameOver" | "new";

export interface Message {
  type: MessageType;
  data?: any;
}

const peer = new Peer();

let state = {
  isHost: false,
  connections: [] as DataConnection[],
  connection: undefined as DataConnection | undefined,
};

const stream = new ReplaySubject<Message>();

export const usePeer = () => {
  const { createGame } = useGameFactory();

  const open = (callback: (id: string) => void) => {
    peer.on("open", callback);
    peer.on("connection", (connection) => {
      state.connections.push(connection);
      stream.next({ type: "connection", data: state.connections.length + 1 });

      connection.on("data", (message) => stream.next(message));
    });
  }

  const connect = (id: string) => {
    state.connection = peer.connect(id);
    state.connection.on("data", (message: Message) => {
      if (message.type === "start") {
        createGame();
      }
      stream.next(message);
    });
  };

  const setIsHost = () => state.isHost = true;

  const send = (type: MessageType, data: any) => {
    const message = { type, data };
    state.isHost ? state.connections.forEach(conn => conn.send(message)) : state.connection?.send(message);
  }

  return {
    peer,
    stream,
    state,
    open,
    connect,
    setIsHost,
    send,
  };
};
