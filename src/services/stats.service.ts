import { ref } from "vue";
import { usePeer } from "./peer.service";

interface StatsState {
  planets: Record<string, PlanetStats>;
}

export interface PlanetStats {
  score: number;
  wins: number;
  kills: number;
}

const state = ref<StatsState>({
  planets: {},
});

export const useStats = () => {
  const { state: peerState, send } = usePeer();

  const addPlanet = (planetId: string ) => {
    const planets = { ...state.value.planets, [planetId]: { score: 0, wins: 0, kills: 0 } };
    update({ planets });
  }

  const incrementPlanetWins = (planetId: string) => {
    const currentStats = state.value.planets[planetId];
    if (currentStats) {
      updatePlanetStats(planetId, { wins: currentStats.wins + 1, score: currentStats.score + 1 });
    }
  }

  const incrementPlanetKills = (planetId: string) => {
    const currentStats = state.value.planets[planetId];
    if (currentStats) {
      updatePlanetStats(planetId, { kills: currentStats.kills + 1, score: currentStats.score + 1 });
    }
  }

  const updatePlanetStats = (planetId: string, stats: Partial<PlanetStats>) => {
    const existingStats = state.value.planets[planetId];
    const planets = { ...state.value.planets, [planetId]: { ...existingStats, ...stats } };
    update({ planets });
    if (peerState.isHost) {
      send("updateStats", { id: planetId, diff: stats });
    }
  }

  const update = (diff: Partial<StatsState>) => {
    state.value = { ...state.value, ...diff };
  }

  return {
    state,
    addPlanet,
    incrementPlanetWins,
    incrementPlanetKills,
    updatePlanetStats,
  };
};
