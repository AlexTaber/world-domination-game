<template>
  <form>
    <input :value="state.name" :default="state.name" @change="handleChange" />
  </form>
</template>

<script setup lang="ts">
import { usePlayerFormState } from "../services/player-form.service";
const { state, update } = usePlayerFormState();

function handleChange(event: any) {
  event.preventDefault();
  update({ name: event.currentTarget.value });
}
</script>
