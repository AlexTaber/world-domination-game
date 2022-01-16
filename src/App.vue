<template>
  <Navigation />

  <router-view v-if="peerId" />
</template>

<script setup lang="ts">
import { Ref, ref } from "vue";
import { usePeer } from "./services/peer.service";
import Navigation from "./components/Navigation.vue";

const { open } = usePeer();

const peerId = ref(undefined) as Ref<string | undefined>;

open((id: string) => peerId.value = id);
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  background: #100c08;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: white;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: white;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
