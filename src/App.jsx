import { useState } from 'react';
import LoginForm from './components/LoginForm';

const STORAGE_KEY = 'greenApiCredentials';

function loadCredentials() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export default function App() {
  const [credentials, setCredentials] = useState(loadCredentials);

  function handleLogin(creds) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
    setCredentials(creds);
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    setCredentials(null);
  }

  if (!credentials) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div>
      <p>Вы вошли. Инстанс: {credentials.idInstance}</p>
      <button onClick={handleLogout}>Выйти</button>
    </div>
  );
}