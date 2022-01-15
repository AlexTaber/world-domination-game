import { arrayUpdateItemByProperty } from "../utils/array-utils";
import { ref } from "vue";

interface StatsState {
  planets: Record<string, PlanetStats>;
}

interface PlanetStats {
  wins: number;
}

const state = ref<StatsState>({
  planets: {},
});

export const useStats = () => {
  const addPlanet = (planetId: string ) => {
    const planets = { ...state.value.planets, [planetId]: { wins: 0 } };
    update({ planets });
  }

  const incrementPlanetWins = (planetId: string) => {
    const currentWins = state.value.planets[planetId]?.wins || 0;
    updatePlanetStats(planetId, { wins: currentWins + 1 });
  }

  const updatePlanetStats = (planetId: string, stats: Partial<PlanetStats>) => {
    const exisitingStats = state.value.planets[planetId];
    const planets = { ...state.value.planets, [planetId]: { ...exisitingStats, ...stats } };
    update({ planets });
  }

  const update = (diff: Partial<StatsState>) => {
    state.value = { ...state.value, ...diff };
  }

  return {
    state,
    addPlanet,
    incrementPlanetWins,
  };
};
