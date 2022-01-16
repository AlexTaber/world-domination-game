<template>
  <div>Loading</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePeer } from '../services/peer.service';

const { peer, setIsHost } = usePeer();

const router = useRouter();

onMounted(() => setHostAndRedirectToLobby());

const setHostAndRedirectToLobby = () => {
  router.push({ name: "Lobby", params: { gameId: peer.id } });
  setIsHost();
}
</script>
