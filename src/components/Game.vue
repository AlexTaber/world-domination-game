<template>
  <div class="gameContainer">
    <div class="leaderBoard">
      <div
        class="player"
        v-for="planet in state.planets"
        :key="planet.id"
        :class="{ destroyed: planet.destroyed }"
      >
        <p>{{ planet.name }}</p>
      </div>
    </div>
    <div id="game" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useGameFactory } from "../factories/game.factory";
import { usePublicGameState } from "../services/public-game-state.service";

const { createGame } = useGameFactory();

const { state } = usePublicGameState();

let game: Phaser.Game | undefined = undefined;

onMounted(() => (game = createGame()));

onUnmounted(() => game?.destroy(true, false));
</script>

<style>
.gameContainer {
  display: flex;
  justify-content: center;
}

.leaderBoard {
  display: flex;
  flex-direction: column;
  margin-right: 16px;
  padding-top: 5px;
}

.player {
  border: 1px solid black;
  padding: 4px 8px;
  min-width: 200px;
}

.player + .player {
  margin-top: 8px;
}

.destroyed {
  background-color: red;
}
</style>
