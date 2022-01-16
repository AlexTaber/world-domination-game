<template>
  <Leaderboard class="leaderboard" />

  <GameMenu class="gameMenu" />

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
import GameMenu from "./GameMenu.vue";
import { usePublicGameState } from "../services/public-game-state.service";

const { state } = usePublicGameState();

const winner = computed(() => state.value.winner);

const { createGame } = useGameFactory();

let game: Phaser.Game | undefined = undefined;

onMounted(() => (game = createGame()));

onUnmounted(() => game?.destroy(true, false));
</script>

<style>
.leaderboard {
  position: fixed;
  left: 80px;
  top: 50px;
  z-index: 1;
}

.gameMenu {
  position: fixed;
  right: 80px;
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
