import Peer, { DataConnection } from "peerjs";

import { ReplaySubject } from "rxjs";
import { useGameFactory } from "../factories/game.factory";

type MessageType = "start" | "update";

export interface Message {
  type: MessageType;
  data: any;
}

const peer = new Peer();

let state = {
  isHost: false,
  connections: [] as DataConnection[],
};

const stream = new ReplaySubject<Message>();

export const usePeer = () => {
  const { createGame } = useGameFactory();

  const open = (callback: (id: string) => void) => {
    peer.on("open", callback);
    peer.on("connection", (connection) => {
      console.log("connection!")
      state.connections.push(connection);
    });
  }

  const connect = (id: string) => {
    const conn = peer.connect(id);
    conn.on("data", (message: Message) => {
      if (message.type === "start") {
        createGame();
      }
      stream.next(message);
    });
  };

  const setIsHost = () => state.isHost = true;

  const sendIfHost = (type: MessageType, data: any) => {
    if (state.isHost) {
      state.connections.forEach(conn => conn.send({
        type,
        data,
      }));
    }
  }

  return {
    peer,
    stream,
    open,
    connect,
    setIsHost,
    sendIfHost,
  };
};
