<template>
  <div id="game" />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useGameFactory } from "../factories/game.factory";

const { createGame } = useGameFactory();

onMounted(() => createGame());
</script>
