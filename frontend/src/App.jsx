import { useState } from "react";
import { clearSession, getStoredUser } from "./api";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ComplaintDetail from "./pages/ComplaintDetail";

export default function App() {
  const [user, setUser] = useState(getStoredUser);
  const [selectedId, setSelectedId] = useState(null);

  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  function logout() {
    clearSession();
    setUser(null);
    setSelectedId(null);
  }

  return (
    <>
      <header className="topbar">
        <span className="brand"><span className="brand-mark" aria-hidden="true">M</span>Campus Maintenance Tracker</span>
        <span className="who">
          <span><strong>{user.name}</strong> ({user.role})</span>
          <button className="secondary" type="button" onClick={logout}>Log out</button>
        </span>
      </header>
      {selectedId ? (
        <ComplaintDetail id={selectedId} user={user} onBack={() => setSelectedId(null)} />
      ) : (
        <Dashboard user={user} onSelect={setSelectedId} />
      )}
    </>
  );
}
