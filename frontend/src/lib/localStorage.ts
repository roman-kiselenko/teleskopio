export function getLocalBoolean(key: string, defaultValue = false): boolean {
  const value = localStorage.getItem(key);
  return value === null ? defaultValue : value === 'true';
}

export function setLocalBoolean(key: string, value: boolean) {
  localStorage.setItem(key, value.toString());
}

export function getLocalKey(key: string) {
  const value = localStorage.getItem(key);
  return value === null ? '{}' : value;
}

export function setLocalKey(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function delLocalKey(key: string) {
  localStorage.removeItem(key);
}
