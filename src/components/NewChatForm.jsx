import { useState } from 'react';
import { checkAccount } from '../api/greenApi';
import { normalizePhone } from '../utils/phone';

export default function NewChatForm({ credentials, onCreate }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const normalized = normalizePhone(phone);
    if (!normalized) {
      setError('Введите номер в формате +7XXXXXXXXXX или +375XXXXXXXXX');
      return;
    }

    setLoading(true);
    try {
      const { exist, chatId } = await checkAccount(
        credentials.idInstance,
        credentials.apiTokenInstance,
        normalized,
      );
      if (!exist) {
        setError('У этого номера нет аккаунта в MAX');
        return;
      }
      onCreate({ id: chatId, title: `+${normalized}` });
      setPhone('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="new-chat-form" onSubmit={handleSubmit}>
      <input
        placeholder="Номер телефона"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button className="new-chat-button" type="submit" disabled={loading}>
        {loading ? '...' : 'Создать чат'}
      </button>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}