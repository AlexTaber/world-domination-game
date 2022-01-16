<template>
  <h1>Lobby</h1>

  <p>hello</p>

  <NewPlayerForm />

  <p v-if="peerState.isHost">Current Player(s): {{ state.playerCount }}</p>

  <p v-else>Waiting for host to start the game!</p>

  <div v-if="peerState.isHost">
    <div>
      <label for="AI Bots">AI Bots</label>

      <input
        name="AI Bots"
        type="number"
        min="0"
        max="7"
        :value="state.aiBots"
        @input="update({ aiBots: Number($event.target.value) })"
      >
    </div>

    <button @click="navigateToGame">Start Game</button>
  </div>
</template>

<script setup lang="ts">
import { Subscription } from "rxjs";
import { usePeer } from "../services/peer.service";
import { useLobby } from "../services/lobby.service";
import { onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import NewPlayerForm from "./NewPlayerForm.vue";

const { state, update } = useLobby();

const { state: peerState, stream, connect, clearConnections } = usePeer();

const route = useRoute();

const router = useRouter();

let subscription: Subscription | undefined;

onMounted(() => connectAndSubscribe());

onUnmounted(() => subscription?.unsubscribe());

const connectAndSubscribe = () => {
  peerState.isHost ? clearConnections() : connect(route.params.gameId as string);
  subscribe();
  console.log(peerState.connection);
};

const subscribe = () => {
  subscription = stream.subscribe((message) => {
    if (message.type === "connection") {
      update({ playerCount: message.data });
    }

    if (message.type === "start") {
      navigateToGame();
    }
  });
};

const navigateToGame = () =>
  router.push({ name: "Game", params: { gameId: route.params.gameId } });

</script>
