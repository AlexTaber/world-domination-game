import { GameScene } from "../scenes/Game";
import { ref, Ref } from "vue";

interface PublicGameState {
  planets: PublicPlanet[];
  winner?: PublicPlanet;
}

interface PublicPlanet {
  id: string;
  name: string;
}

const state = ref({}) as Ref<PublicGameState>;

export const usePublicGameState = () => {
  const updateFromGame = (game: GameScene) => {
    const publicPlanets =  game.planets.map(p => ({id: p.id, name: p.name }));
    update({
      winner: publicPlanets.find(p => p.id === game.winnerId),
      planets: publicPlanets,
    });
  }

  const update = (newState: Partial<PublicGameState>) => {
    state.value = {
      ...state.value,
      ...newState
    }
  }

  return {
    state,
    updateFromGame,
  };
}
