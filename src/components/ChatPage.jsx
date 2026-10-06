import { useRef, useState } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import useNotifications from '../hooks/useNotifications';
import { sendMessage } from '../api/greenApi';

function formatTime(date = new Date()) {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPage({ credentials, onLogout }) {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState({});
  const [activeChatId, setActiveChatId] = useState(null);
  const seenIds = useRef(new Set());

  const activeChat = chats.find((c) => c.id === activeChatId);

  function addMessage(chatId, message) {
    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), message],
    }));
  }

  function updateMessage(chatId, id, patch) {
    setMessages((prev) => ({
      ...prev,
      [chatId]: (prev[chatId] || []).map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  }

  function handleCreateChat(chat) {
    // Если такой чат уже есть, просто открываем его
    setChats((prev) => (prev.some((c) => c.id === chat.id) ? prev : [chat, ...prev]));
    setActiveChatId(chat.id);
  }

  async function handleSend(text) {
    const chatId = activeChatId;
    const localId = `local-${Date.now()}`;

    addMessage(chatId, {
      id: localId,
      text,
      type: 'outgoing',
      status: 'sending',
      time: formatTime(),
    });

    try {
      const idMessage = await sendMessage(
        credentials.idInstance,
        credentials.apiTokenInstance,
        chatId,
        text,
      );
      updateMessage(chatId, localId, { status: 'sent', idMessage });
    } catch {
      updateMessage(chatId, localId, { status: 'error' });
    }
  }

  function handleNotification(body) {
    // Интересуют только входящие текстовые сообщения
    if (body?.typeWebhook !== 'incomingMessageReceived') return;

    const messageData = body.messageData;
    if (messageData?.typeMessage !== 'textMessage') return;

    const text = messageData.textMessageData?.textMessage;
    const chatId = body.senderData?.chatId;
    if (!text || !chatId) return;

    // Защита от дублей, если уведомление пришло повторно
    if (seenIds.current.has(body.idMessage)) return;
    seenIds.current.add(body.idMessage);

    const phone = body.senderData.senderPhoneNumber;
    const title = phone ? `+${phone}` : body.senderData.senderName || chatId;
    const date = body.timestamp ? new Date(body.timestamp * 1000) : new Date();

    // Если пишет собеседник, которого нет в списке, создаём для него чат
    setChats((prev) => (prev.some((c) => c.id === chatId) ? prev : [{ id: chatId, title }, ...prev]));
    addMessage(chatId, {
      id: `in-${body.idMessage}`,
      text,
      type: 'incoming',
      time: formatTime(date),
    });
  }

  const pollError = useNotifications(credentials, handleNotification);

  return (
    <div className="chat-page">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        credentials={credentials}
        onSelect={setActiveChatId}
        onCreateChat={handleCreateChat}
        onLogout={onLogout}
      />
      <ChatWindow chat={activeChat} messages={messages[activeChatId]} onSend={handleSend} />
      {pollError && <div className="poll-error">Не удаётся получать сообщения: {pollError}</div>}
    </div>
  );
}