<template>
  <div id="game" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useGameFactory } from "../factories/game.factory";

const { createGame } = useGameFactory();

let game: Phaser.Game | undefined = undefined;

onMounted(() => game = createGame());

onUnmounted(() => game?.destroy(true, false));
</script>
