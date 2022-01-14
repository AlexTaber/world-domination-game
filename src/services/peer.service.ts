import Peer, { DataConnection } from "peerjs";

const peer = new Peer();

let state = {
  isHost: false,
  connections: [] as DataConnection[],
};

export const usePeer = () => {
  const open = (callback: (id: string) => void) => {
    peer.on("open", callback);
    peer.on("connection", (connection) => {
      console.log("connection!")
      state.connections.push(connection);
    });
  }

  const connect = (id: string) => {
    const conn = peer.connect(id);
    conn.on("data", (data) => console.log('RECEIVED', data));
  };

  const setIsHost = () => state.isHost = true;

  const sendIfHost = (data: any) => {
    if (state.isHost) {
      state.connections.forEach(conn => conn.send(data));
    }
  }

  return {
    peer,
    open,
    connect,
    setIsHost,
    sendIfHost,
  };
};
