<template>
  <div class="images">
    <img class="rotate" src="../../public/assets/asteroid.png" />
    <img class="rotate" src="../../public/assets/planet-1.png" />
  </div>
  <h1 id="congratsMessage">CONGRATS</h1>
  <h1>{{ winner }}!</h1>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { PublicPlanet } from "../services/public-game-state.service";

const props = defineProps<{
  winner: PublicPlanet;
}>();

const winner = props.winner;
</script>
<style>
#congratsMessage {
  color: Orange;
  font-size: 50px;
  font-family: Monaco;
}
.rotate {
  animation: rotation 4s infinite linear;
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(359deg);
  }
}

.images {
}
</style>
