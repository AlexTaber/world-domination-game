import { AlexAI } from "../ai/alex.ai"
import { BaseAI } from "../ai/base.ai";

export const useAISelector = () => {
  const ais: typeof BaseAI[] = [
    AlexAI,
  ];

  let aiIndex = 0;

  const getAI = () => {
    const currentIndex = aiIndex;
    aiIndex = (aiIndex + 1) % ais.length;
    return ais[currentIndex] as typeof BaseAI;
  }

  const reset = () => aiIndex = 0;

  return {
    getAI,
    reset,
  };
}
