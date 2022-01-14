import { ref, Ref } from "vue";

interface PlayerState {
  name: "hi";
  image: "";
}

const state = ref({}) as Ref<PlayerState>;
export const usePlayerFormState = () => {
  const update = (newState: Partial<PlayerState>) => {
    state.value = {
      ...state.value,
      ...newState,
    };
  };

  return {
    state,
    update,
  };
};
