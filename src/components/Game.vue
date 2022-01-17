<template>
  <Leaderboard class="leaderboard" />

  <div class="gameContainer">
    <div class="gameWrapper">
      <div v-if="winner" class="gameOverOverlay">
        <WinnerScreen :winner="winner" />
      </div>

      <div id="game" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from "vue";
import { useGameFactory } from "../factories/game.factory";
import WinnerScreen from "./WinnerScreen.vue";
import Leaderboard from "./Leaderboard.vue";
import { usePublicGameState } from "../services/public-game-state.service";
import { usePeer } from "../services/peer.service";
import { useRouter } from "vue-router";

const { state } = usePublicGameState();

const { state: peerState, clearConnections } = usePeer();

const router = useRouter();

const winner = computed(() => state.value.winner);

const { createGame } = useGameFactory();

let game: Phaser.Game | undefined = undefined;

onMounted(() => checkConnectionAndCreateGame());

onUnmounted(() => {
  clearConnections();
  game?.destroy(true, false);
});

const checkConnectionAndCreateGame = () => {
  const hasValidConnection = peerState.isHost || peerState.connection;
  hasValidConnection ? setGame() : redirectHome();
}

const setGame = () => game = createGame();

const redirectHome = () => router.push({ name: "Home" });
</script>

<style>
.leaderboard {
  position: fixed;
  left: 80px;
  top: 50px;
  z-index: 1;
}

.gameContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.gameWrapper {
  position: relative;
}

.gameOverOverlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(16, 12, 8, 0.5);
}
</style>
