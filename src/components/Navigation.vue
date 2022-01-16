<template>
  <div class="navigation">
    <button @click="onClick">Return to Lobby</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const onClick = () => router.push({ name: "Home" });
</script>

<style scoped>
.navigation {
  position: fixed;
  right: 80px;
  top: 50px;
  z-index: 1;
}
</style>
