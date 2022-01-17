import { isEqual } from "lodash";


export function diff(obj1: any, obj2: any) {
  const diff = Object.keys(obj1).reduce((result, key) => {
      if (!obj2.hasOwnProperty(key)) {
          result.push(key);
      } else if (isEqual(obj1[key], obj2[key])) {
          const resultKeyIndex = result.indexOf(key);
          result.splice(resultKeyIndex, 1);
      }
      return result;
  }, Object.keys(obj2));

  return diff;
}
