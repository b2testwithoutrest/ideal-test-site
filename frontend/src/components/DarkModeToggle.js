import React from "react";

function DarkModeToggle({ mode, setMode }) {
  return (
    <div className="mb-2 text-end">
      <button
        className="btn btn-outline-secondary"
        onClick={() => setMode(mode === "dark" ? "light" : "dark")}
      >
        {mode === "dark" ? "🌙 Dark" : "☀️ Light"}
      </button>
    </div>
  );
}
export default DarkModeToggle;