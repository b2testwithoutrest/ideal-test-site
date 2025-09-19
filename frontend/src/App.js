import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Wall from "./components/Wall";
import AdminPanel from "./components/AdminPanel";
import DarkModeToggle from "./components/DarkModeToggle";
import "bootstrap/dist/css/bootstrap.min.css";

const API_ROOT = "https://ideal-test-site.onrender.com/api"; // Change to your backend URL when deployed

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [mode, setMode] = useState(localStorage.getItem("mode") || "light");

  useEffect(() => {
    document.body.className = mode === "dark" ? "bg-dark text-light" : "";
  }, [mode]);

  const handleLogin = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Ideal Test Site</h1>
      <DarkModeToggle mode={mode} setMode={setMode} />
      {!token ? (
        <>
          <Login onLogin={handleLogin} api={API_ROOT} />
          <Register api={API_ROOT} />
          <Wall api={API_ROOT} />
        </>
      ) : (
        <>
          <Dashboard api={API_ROOT} token={token} onLogout={handleLogout} />
          <Wall api={API_ROOT} />
          {user?.is_admin ? (
            <AdminPanel api={API_ROOT} token={token} />
          ) : null}
        </>
      )}
    </div>
  );
}

export default App;
