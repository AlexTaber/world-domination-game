<template>
  <h1>Lobby</h1>

  <p>hello</p>

  <NewPlayerForm />

  <p v-if="state.isHost">Current Player(s): {{ playerCount }}</p>

  <p v-else>Waiting for host to start the game!</p>

  <div v-if="state.isHost">
    <button @click="navigateToGame">Start Game</button>
  </div>
</template>

<script setup lang="ts">
import { Subscription } from "rxjs";
import { usePeer } from "../services/peer.service";
import { onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import NewPlayerForm from "./NewPlayerForm.vue";

const { state, stream, connect, clearConnections } = usePeer();

const route = useRoute();

const router = useRouter();

const playerCount = ref(1);

let subscription: Subscription | undefined;

onMounted(() => connectAndSubscribe());

onUnmounted(() => subscription?.unsubscribe());

const connectAndSubscribe = () => {
  state.isHost ? clearConnections() : connect(route.params.gameId as string);
  subscribe();
  console.log(state.connection);
};

const subscribe = () => {
  subscription = stream.subscribe((message) => {
    if (message.type === "connection") {
      playerCount.value = message.data;
    }

    if (message.type === "start") {
      navigateToGame();
    }
  });
};

const navigateToGame = () =>
  router.push({ name: "Game", params: { gameId: route.params.gameId } });
</script>
