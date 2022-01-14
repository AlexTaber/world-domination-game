import { useGameFactory } from './factories/game.factory';
import { usePeer } from './services/peer.service';

const { peer, open, connect, setIsHost } = usePeer();

const { createGame } = useGameFactory();

open((id: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get('gameId');

  gameId ? connectToExistingConnection(gameId) : pushGameIdToUrl();
});

const pushGameIdToUrl = () => {
  const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?gameId=${peer.id}`;
  window.history.pushState({path:newurl},'',newurl);
  setIsHost();
}

const connectToExistingConnection = (id: string) => {
  connect(id);
}

document.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
      createGame();
  }
});
