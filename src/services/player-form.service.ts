import { ref, Ref } from "vue";

interface PlayerState {
  name: string;
  image: string;
}

const state = ref({ name: "Obama", image: "" }) as Ref<PlayerState>;
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
