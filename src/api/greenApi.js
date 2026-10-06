const API_URL = import.meta.env.VITE_GREEN_API_URL || 'https://api.green-api.com';

export function buildUrl(idInstance, apiTokenInstance, method) {
  return `${API_URL}/waInstance${idInstance}/${method}/${apiTokenInstance}`; // собираем адрес запроса
}

export async function getStateInstance(idInstance, apiTokenInstance) {
  const res = await fetch(buildUrl(idInstance, apiTokenInstance, 'getStateInstance'));
  if (!res.ok) {
    throw new Error(`Ошибка запроса: ${res.status}`);
  }
  const data = await res.json();
  return data.stateInstance;
}

export async function checkAccount(idInstance, apiTokenInstance, phoneNumber) {
  const res = await fetch(buildUrl(idInstance, apiTokenInstance, 'checkAccount'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: Number(phoneNumber) }),
  });
  if (res.status === 469) {
    throw new Error('Слишком много проверок номеров. Подождите и попробуйте позже.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.status === false) {
    throw new Error(data.reason || `Ошибка запроса: ${res.status}`);
  }
  return data; // { exist, chatId, fromCache }
}

export async function sendMessage(idInstance, apiTokenInstance, chatId, message) {
  const res = await fetch(buildUrl(idInstance, apiTokenInstance, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.idMessage) {
    throw new Error(data.reason || data.message || `Ошибка отправки: ${res.status}`);
  }
  return data.idMessage;
}

export async function receiveNotification(idInstance, apiTokenInstance, signal) {
  const url = `${buildUrl(idInstance, apiTokenInstance, 'receiveNotification')}?receiveTimeout=20`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.reason || `Ошибка получения: ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null; // null: за время ожидания ничего не пришло
}

export async function deleteNotification(idInstance, apiTokenInstance, receiptId) {
  const url = `${buildUrl(idInstance, apiTokenInstance, 'deleteNotification')}/${receiptId}`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`Ошибка удаления уведомления: ${res.status}`);
  }
  const data = await res.json().catch(() => ({}));
  return data.result === true;
}