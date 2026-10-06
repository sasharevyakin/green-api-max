const API_URL = import.meta.env.VITE_GREEN_API_URL || 'https://api.green-api.com';

export function buildUrl(idInstance, apiTokenInstance, method) {
  return `${API_URL}/waInstance${idInstance}/${method}/${apiTokenInstance}`; // тут собираю адрес для запроса к API
}

export async function getStateInstance(idInstance, apiTokenInstance) {
  const res = await fetch(buildUrl(idInstance, apiTokenInstance, 'getStateInstance'));
  if (!res.ok) {
    throw new Error(`Ошибка запроса: ${res.status}`);
  }
  const data = await res.json();
  return data.stateInstance;
}