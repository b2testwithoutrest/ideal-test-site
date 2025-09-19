import React, { useEffect, useState } from "react";

function Wall({ api }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetch(`${api}/entries/wall`).then(res => res.json()).then(setEntries);
  }, []);

  return (
    <div className="mb-4">
      <h2>Public Wall</h2>
      {entries.length === 0 ? (
        <div>No public entries yet.</div>
      ) : (
        <ul className="list-group">
          {entries.map(e => (
            <li className="list-group-item" key={e.id}>
              <b>{e.username}</b>: {e.content}
              <span className="float-end text-muted" style={{ fontSize: "0.9em" }}>
                {new Date(e.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
export default Wall;