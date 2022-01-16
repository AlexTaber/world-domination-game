import { ref, Ref } from "vue";
import { getRandomPlanetName } from "./planet-name.generator";

interface PlayerState {
  name: string;
  image: string;
}

const state = ref({ name: getRandomPlanetName(), image: "" }) as Ref<PlayerState>;

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
