// import { useGameFactory } from './factories/game.factory';
// import { usePeer } from './services/peer.service';

// const { peer, stream, open, connect, setIsHost } = usePeer();

// const { createGame } = useGameFactory();

// open((id: string) => {
//   const urlParams = new URLSearchParams(window.location.search);
//   const gameId = urlParams.get('gameId');

//   gameId ? connectToExistingConnection(gameId) : pushGameIdToUrl();
// });

// stream.subscribe(message => {
//   if (message.type === "connection") {
//     const el = document.getElementById("connections");
//     if (el) el.innerHTML = `${message.data} Player(s) Ready`;
//   }
// })

// const pushGameIdToUrl = () => {
//   const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?gameId=${peer.id}`;
//   window.history.pushState({path:newurl},'',newurl);
//   setIsHost();
// }

// const connectToExistingConnection = (id: string) => {
//   connect(id);
// }

// document.getElementById("newGame")?.addEventListener("click", (event) => {
//   createGame();
// });
