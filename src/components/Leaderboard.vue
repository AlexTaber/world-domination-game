<template>
  <div class="leaderBoard">
    <div
      class="player"
      v-for="planet in orderedPlanets"
      :key="planet.id"
      :class="{ destroyed: planet.destroyed, winner: planet.id === state.winner?.id }"
    >
      <p>{{ getScore(planet) }} - {{ planet.name }}</p>
      <p class="skull">&#128128;</p>
      <p class="destroyedText">Destroyed</p>
      <p class="winnerText">WINNER</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStats } from "../services/stats.service";
import { PublicPlanet, usePublicGameState } from "../services/public-game-state.service";
import { computed } from "vue";

const { state } = usePublicGameState();

const { state: stats } = useStats();

const getScore = (planet: PublicPlanet) => stats.value.planets[planet.id]?.score || 0;

const orderedPlanets = computed(() => state.value.planets.sort((a, b) => stats.value.planets[a.id]!.score > stats.value.planets[b.id]!.score ? -1 : 1));
</script>

<style scoped>
.leaderBoard {
  display: flex;
  flex-direction: column;
  margin-right: 32px;
  padding-top: 5px;
}

.player {
  border-left: 5px solid green;
  padding: 4px 8px 4px 30px;
  min-width: 150px;
  position: relative;
  background-color: rgba(0, 128, 0, 0.1);
  text-align: left;
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

.destroyedText {
  visibility: hidden;
  position: absolute;
  font-weight: bold;
  color: red;
  top: 50%;
  right: 0;
  transform: translate(-15%, -40%);
}

.winnerText {
  visibility: hidden;
  position: absolute;
  font-weight: bold;
  color: green;
  top: 50%;
  right: 0;
  transform: translate(-15%, -40%);
}

.player.destroyed .skull {
  visibility: visible;
}

.player.destroyed .destroyedText {
  animation: destroyedText-animation 0.8s ease-in-out;
}

.player.destroyed {
  animation: scale-animation 0.8s ease-in-out;
}

.player.winner .winnerText {
  animation: winner-animation 0.8s ease-in-out;
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

@keyframes destroyedText-animation {
  0% {
    transform: scale(1);
    opacity: 0;
    visibility: visible;
  }
  50% {
    transform: scale(1.4);
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(-15%, -40%);
  }
}

@keyframes winner-animation {
  0% {
    transform: scale(1);
    opacity: 0;
    visibility: visible;
  }
  50% {
    transform: scale(1.4);
    opacity: 1;
  }
  100% {
    transform: translate(-15%, -40%);
  }
}
</style>