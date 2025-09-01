export function getLocalBoolean(key: string, defaultValue = false): boolean {
  const value = localStorage.getItem(key);
  return value === null ? defaultValue : value === 'true';
}

export function setLocalBoolean(key: string, value: boolean) {
  localStorage.setItem(key, value.toString());
}
