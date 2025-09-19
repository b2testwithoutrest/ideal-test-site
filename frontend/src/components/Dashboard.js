import React, { useEffect, useState } from "react";
import Entries from "./Entries";

function Dashboard({ api, token, onLogout }) {
  const [entries, setEntries] = useState([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const fetchEntries = async () => {
    const res = await fetch(`${api}/entries`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEntries(await res.json());
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch(`${api}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (data.success) {
      fetchEntries();
      setContent("");
    } else {
      setError(data.error || "Failed");
    }
  };

  return (
    <div className="mb-4">
      <h2>Your Dashboard</h2>
      <button className="btn btn-outline-danger float-end" onClick={onLogout}>Logout</button>
      <form onSubmit={handleAdd} className="mb-2">
        <input className="form-control" placeholder="New entry..." value={content} onChange={e => setContent(e.target.value)} required />
        <button className="btn btn-success mt-2">Add Entry</button>
      </form>
      <Entries entries={entries} api={api} token={token} refresh={fetchEntries} />
      {error && <div className="text-danger mt-2">{error}</div>}
    </div>
  );
}
export default Dashboard;