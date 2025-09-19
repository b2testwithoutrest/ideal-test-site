import React from "react";

function Entries({ entries, api, token, refresh }) {
  const handleDelete = async (id) => {
    await fetch(`${api}/entries/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    refresh();
  };

  return (
    <div>
      <h3>Your Entries</h3>
      {entries.length === 0 ? (
        <div>No entries yet.</div>
      ) : (
        <ul className="list-group">
          {entries.map((e) => (
            <li className="list-group-item d-flex justify-content-between" key={e.id}>
              <span>{e.content} <small className="text-muted">{new Date(e.created_at).toLocaleString()}</small></span>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(e.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
export default Entries;