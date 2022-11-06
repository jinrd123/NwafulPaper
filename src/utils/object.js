export function set(obj, key, value) {
    const keys = key.split(".");
    const lastKey = keys.pop();
    const o = keys.reduce((o, key) => o[key], obj);
    o[lastKey] = value;
  }
  
  export function get(obj, key) {
    const keys = key.split(".");
    return keys.reduce((obj, key) => obj[key], obj);
  }