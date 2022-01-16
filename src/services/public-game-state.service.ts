import { GameScene } from "../scenes/Game";
import { ref, Ref } from "vue";

interface PublicGameState {
  planets: PublicPlanet[];
  winner?: PublicPlanet;
}

export interface PublicPlanet {
  id: string;
  name: string;
  destroyed: boolean;
  isPlayer: boolean;
}

const state = ref({
  planets: [],
}) as Ref<PublicGameState>;

export const usePublicGameState = () => {
  const updateFromGame = (game: GameScene) => {
    const publicPlanets = getPublicPlanetsFromGame(game);
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

  const getPublicPlanetsFromGame = (game: GameScene) => {
    return game.planets.map((p) => ({
      id: p.id,
      name: p.name,
      destroyed: p.destroyed,
      isPlayer: p.id === game.playerPlanet?.id,
    }));
  }

  return {
    state,
    updateFromGame,
  };
};
