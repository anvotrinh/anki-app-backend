export function uniq_array(arr, idFn) {
  const ret = [];
  const exists = {};
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    const itemId = idFn(item);
    if (exists[itemId] !== undefined) {
      continue;
    }
    ret.push(item);
    exists[itemId] = true;
  }
  return ret;
}
