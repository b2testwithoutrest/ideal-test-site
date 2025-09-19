import React, { useState } from "react";

function Register({ api }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    const res = await fetch(`${api}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success) {
      setMsg("Registration successful! Please log in.");
    } else {
      setError(data.error || "Register failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <h2>Register</h2>
      <div className="mb-2">
        <input className="form-control" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
      </div>
      <div className="mb-2">
        <input className="form-control" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <button className="btn btn-secondary">Register</button>
      {msg && <div className="text-success mt-2">{msg}</div>}
      {error && <div className="text-danger mt-2">{error}</div>}
    </form>
  );
}
export default Register;