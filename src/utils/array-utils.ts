export function arrayUpdateItemByProperty<T, K extends keyof T>(
  array: T[],
  property: K,
  propertyValue: T[K],
  payload: Partial<T>,
  upsert = false
): T[] {
  let itemFound = false;
  const mappedArray = array.map((item: T) => {
    itemFound = itemFound || item[property] === propertyValue;
    return item[property] === propertyValue ? { ...item, ...payload } : item;
  });

  return itemFound || !upsert ? mappedArray : [...array, payload as T];
}
