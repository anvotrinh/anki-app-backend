export function arrayToMap(arr, keyName) {
  const map = {};
  for (const elm of arr) {
    map[ elm[ keyName ] ] = elm;
  }
  return map;
}

export function arrayToNameIDMap(arr, nameKey, idKey) {
  const map = {};
  for (const elm of arr) {
    map[ elm[ nameKey ] ] = elm[ idKey ];
  }
  return map;
}