export interface WeightedRandomItem<T> {
  value: T,
  weight: number;
}

export const getRandomWeighted = <T>(items: WeightedRandomItem<T>[]): T => {
  let calculatedTotal = 0;
  const weightTotal = items.reduce((total, item) => total + item.weight, 0);
  const randomValue = weightTotal * Math.random();

  for (let item of items) {
    if (randomValue < calculatedTotal + item.weight) {
      return item.value;
    }

    calculatedTotal += item.weight;
  }

  // fallback
  return items[0].value;
}
