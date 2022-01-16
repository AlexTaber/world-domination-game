import { ref } from "vue";


interface LobbyState {
  playerCount: number;
  aiBots: number;
  aiOnly: boolean;
}

const state = ref<LobbyState>({
  playerCount: 1,
  aiBots: 3,
  aiOnly: false,
});

export const useLobby = () => {
  const update = (diff: Partial<LobbyState>) => state.value = { ...state.value, ...diff };

  return {
    state,
    update,
  };
}
