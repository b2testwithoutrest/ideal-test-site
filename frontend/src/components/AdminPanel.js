import React, { useEffect, useState } from "react";

function AdminPanel({ api, token }) {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ users: 0, entries: 0 });

  const fetchUsers = async () => {
    const res = await fetch(`${api}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(await res.json());
  };

  const fetchStats = async () => {
    const res = await fetch(`${api}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStats(await res.json());
  };

  const handleDelete = async (id) => {
    await fetch(`${api}/admin/user/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
    fetchStats();
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  return (
    <div className="mb-4">
      <h2>Admin Panel</h2>
      <div>Users: {stats.users} | Entries: {stats.entries}</div>
      <ul className="list-group">
        {users.map(u => (
          <li className="list-group-item d-flex justify-content-between" key={u.id}>
            <span>{u.username} {u.is_admin ? "(admin)" : ""}</span>
            {!u.is_admin && (
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}>Delete</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default AdminPanel;