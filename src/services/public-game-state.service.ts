import { GameScene } from "../scenes/Game";
import { ref, Ref } from "vue";

interface PublicGameState {
  planets: PublicPlanet[];
  winner?: PublicPlanet;
}

export interface PublicPlanet {
  id: string;
  name: string;
  image?: string;
}

const state = ref({
  planets: [],
}) as Ref<PublicGameState>;

export const usePublicGameState = () => {
  const updateFromGame = (game: GameScene) => {
    const publicPlanets = game.planets.map((p) => ({ id: p.id, name: p.name, destroyed: p.destroyed }));
    update({
      winner: publicPlanets.find((p) => p.id === game.winnerId),
      planets: publicPlanets,
    });
  };

  const update = (newState: Partial<PublicGameState>) => {
    state.value = {
      ...state.value,
      ...newState,
    };
  };

  return {
    state,
    updateFromGame,
  };
};
