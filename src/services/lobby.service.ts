import { ref } from "vue";


interface LobbyState {
  playerCount: number;
  aiBots: number;
}

const state = ref({
  playerCount: 1,
  aiBots: 3,
});

export const useLobby = () => {
  const update = (diff: Partial<LobbyState>) => state.value = { ...state.value, ...diff };

  return {
    state,
    update,
  };
}
