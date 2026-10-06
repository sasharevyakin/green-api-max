import { useEffect, useRef, useState } from 'react';
import { receiveNotification, deleteNotification } from '../api/greenApi';

const MIN_POLL_INTERVAL = 1000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function useNotifications(credentials, onNotification) {
  const [error, setError] = useState('');
  const handlerRef = useRef(onNotification);

  // Всегда держим свежую версию обработчика
  useEffect(() => {
    handlerRef.current = onNotification;
  });

  useEffect(() => {
    if (!credentials) return;
    const { idInstance, apiTokenInstance } = credentials;
    let active = true;
    const controller = new AbortController();

    async function poll() {
      while (active) {
        const startedAt = Date.now();
        try {
          const data = await receiveNotification(idInstance, apiTokenInstance, controller.signal);
          if (!active) break;
          setError('');
          if (data) {
            console.log('notification', data);
            handlerRef.current(data.body);
            await deleteNotification(idInstance, apiTokenInstance, data.receiptId);
          }
        } catch (err) {
          if (!active) break;
          setError(err.message);
          await sleep(3000);
        }

        // Не чаще одного запроса в секунду
        const elapsed = Date.now() - startedAt;
        if (active && elapsed < MIN_POLL_INTERVAL) {
          await sleep(MIN_POLL_INTERVAL - elapsed);
        }
      }
    }

    poll();

    return () => {
      active = false;
      controller.abort();
    };
  }, [credentials]);

  return error;
}