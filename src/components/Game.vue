<template>
  <div class="gameContainer">
    <div class="leaderBoard">
      <div
        class="player"
        v-for="planet in state.planets"
        :key="planet.id"
        :class="{ destroyed: planet.destroyed, winner: planet.id === winner?.id }"
      >
        <p>{{ planet.name }}</p>
        <p class="skull">&#128128;</p>
        <p class="wasted">WASTED</p>
        <p class="winnerText">WINNER</p>
      </div>
    </div>

    <div class="gameWrapper" :style="{ width: size.width, height: size.height }">
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
import { usePublicGameState } from "../services/public-game-state.service";
import { useCanvas } from "../services/canvas.service";

const { state } = usePublicGameState();

const { size } = useCanvas();

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

.leaderBoard {
  display: flex;
  flex-direction: column;
  margin-right: 32px;
  padding-top: 5px;
}

.player {
  border-left: 5px solid green;
  padding: 4px 8px;
  min-width: 150px;
  position: relative;
  background-color: rgba(0, 128, 0, 0.1);
}

.player + .player {
  margin-top: 16px;
}

.destroyed {
  border-left: 5px solid red;
  background-color: rgba(240, 52, 52, 0.1);
}

.skull {
  visibility: hidden;
  position: absolute;
  font-size: 30px;
  top: -30%;
  left: -30%;
}

.wasted {
  visibility: hidden;
  position: absolute;
  font-weight: bold;
  color: red;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.winnerText {
  visibility: hidden;
  position: absolute;
  font-weight: bold;
  color: green;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -40%);
}

.player.destroyed .skull {
  visibility: visible;
}

.player.destroyed .wasted {
  animation: wasted-animation 1s ease-in-out;
}

.player.destroyed {
  animation: scale-animation 1s ease-in-out;
}

.player.winner .winnerText {
  animation: winner-animation 1s ease-in-out;
  visibility: visible;
}

/* .player.winner {
  animation: scale-animation 0.5s ease-in-out;
} */

@keyframes scale-animation {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes wasted-animation {
  0% {
    transform: scale(1);
    opacity: 0;
    visibility: visible;
  }
  50% {
    transform: scale(2);
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes winner-animation {
  0% {
    transform: scale(1);
    opacity: 0;
    visibility: visible;
  }
  50% {
    transform: scale(2);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -40%);
  }
}
</style>
