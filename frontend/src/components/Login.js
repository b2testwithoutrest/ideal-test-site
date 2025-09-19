import React, { useState } from "react";

function Login({ onLogin, api }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch(`${api}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success) {
      onLogin(data.token, { username: data.username, is_admin: data.is_admin });
      if (remember) localStorage.setItem("token", data.token);
    } else {
      setError(data.error || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <h2>Login</h2>
      <div className="mb-2">
        <input className="form-control" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
      </div>
      <div className="mb-2">
        <input className="form-control" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <div className="form-check mb-2">
        <input className="form-check-input" type="checkbox" checked={remember} id="remember" onChange={e => setRemember(e.target.checked)} />
        <label className="form-check-label" htmlFor="remember">Remember me</label>
      </div>
      <button className="btn btn-primary">Login</button>
      {error && <div className="text-danger mt-2">{error}</div>}
    </form>
  );
}
export default Login;