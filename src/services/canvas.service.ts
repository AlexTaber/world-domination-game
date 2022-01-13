import { config } from "../config"

export const useCanvas = () => {
  const getCenter = () => ({ x: config.scale.width / 2, y: config.scale.height / 2 });

  const getPercentageHeight = (percentage: number) => config.scale.height * (percentage / 100);

  return {
    getCenter,
    getPercentageHeight,
  };
}
