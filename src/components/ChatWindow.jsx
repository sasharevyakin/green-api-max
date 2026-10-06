import { useEffect, useRef, useState } from 'react';

export default function ChatWindow({ chat, messages = [], onSend }) {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!chat) {
    return (
      <main className="chat-window">
        <p className="empty-state">Выберите чат</p>
      </main>
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  }

  return (
    <main className="chat-window">
      <div className="chat-header">{chat.title}</div>
      <div className="messages">
        {messages.map((m) => (
          <div key={m.id} className={`message ${m.type}`}>
            {m.text}
            <span className="message-time">{m.time}</span>
            {m.type === 'outgoing' && (
            <span className={`message-status ${m.status}`}>
                {m.status === 'sending' && '…'}
                {m.status === 'sent' && '✓'}
                {m.status === 'error' && 'Не отправлено'}
            </span>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form className="message-form" onSubmit={handleSubmit}>
        <input
          placeholder="Напишите сообщение..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="message-button" type="submit">Отправить</button>
      </form>
    </main>
  );
}