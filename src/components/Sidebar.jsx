import NewChatForm from './NewChatForm';

export default function Sidebar({ chats, activeChatId, credentials, onSelect, onCreateChat, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <strong>Чаты</strong>
        <button className="sidebar-button" onClick={onLogout}>Выйти</button>
      </div>
      <NewChatForm credentials={credentials} onCreate={onCreateChat} />
      <ul className="chat-list">
        {chats.length === 0 && <li className="chat-empty">Чатов пока нет</li>}
        {chats.map((chat) => (
          <li
            key={chat.id}
            className={`chat-item ${chat.id === activeChatId ? 'active' : ''}`}
            onClick={() => onSelect(chat.id)}
          >
            {chat.title}
          </li>
        ))}
      </ul>
    </aside>
  );
}