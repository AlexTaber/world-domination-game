<template>
  <div class="gameContainer">
    <Leaderboard />

    <div class="gameWrapper">
      <div class="gameOverOverlay">
        <WinnerScreen v-if="winner" :winner="winner" />
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

const { state } = usePublicGameState();

const winner = computed(() => state.value.winner);

const { createGame } = useGameFactory();

let game: Phaser.Game | undefined = undefined;

onMounted(() => (game = createGame()));

onUnmounted(() => game?.destroy(true, false));
</script>

<style>
.gameContainer {
  display: flex;
  justify-content: center;
}

.gameWrapper {
  position: relative;
}

.gameOverOverlay {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
