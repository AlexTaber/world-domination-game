<template>
  <form>
    <input :value="state.name" />
  </form>
</template>

<script setup lang="ts">
import { usePlayerFormState } from "../services/player-form.service";
const { state, update } = usePlayerFormState();
</script>
