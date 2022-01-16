<template>
  <div class="winnerScreen">
    <h2>WINNER</h2>

    <h1 :class="{
      winnerText: true,
      player: winner?.isPlayer,
    }">{{ winner?.name }}</h1>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { PublicPlanet } from "../services/public-game-state.service";

const props = defineProps<{
  winner: PublicPlanet;
}>();

const winner = props.winner;
</script>

<style scoped>
.winnerScreen {
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 100%;
  padding-top: 120px;
}

.winnerText {
  color: red;
}

.player {
  color: #85c2ff;
}
</style>
