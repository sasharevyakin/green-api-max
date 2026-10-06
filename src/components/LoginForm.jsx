import { useState } from 'react';
import { getStateInstance } from '../api/greenApi';

export default function LoginForm({ onLogin }) {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const id = idInstance.trim();
      const token = apiTokenInstance.trim();
      const state = await getStateInstance(id, token);
      if (state !== 'authorized') {
        setError(`Инстанс не авторизован (статус: ${state})`);
        return;
      }
      onLogin({ idInstance: id, apiTokenInstance: token });
    } catch {
      setError('Не удалось подключиться. Проверьте idInstance и токен.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Вход в чат</h2>
      <input
        placeholder="idInstance"
        value={idInstance}
        onChange={(e) => setIdInstance(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="apiTokenInstance"
        value={apiTokenInstance}
        onChange={(e) => setApiTokenInstance(e.target.value)}
        required
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Проверка...' : 'Войти'}
      </button>
    </form>
  );
}