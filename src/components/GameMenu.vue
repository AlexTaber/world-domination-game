<template>
  <div class="gameMenu">
    <button @click="onClick">Return to Lobby</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const onClick = () => router.push({ name: "Home" });
</script>