import React, { useEffect, useState } from "react";
import api from "../../lib/api";

const UserOverrides = () => {
  const [role, setRole] = useState("HR");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (query.length < 2) return;
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get("/api/admin/users", {
          params: { q: query, role },
        });
        setResults(data?.data || []);
      } catch (err) {
        console.error(err);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query, role]);

  useEffect(() => {
    if (!selected) return;
    // fetch user permissions
  }, [selected]);

  return (
    <div className="uo-wrap">
      <div className="uo-top">
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="HR">HR</option>
          <option value="USER">USER</option>
        </select>
        <input
          placeholder="Search user"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="uo-results">
        {results.map((u) => (
          <div key={u.id} className="uo-row" onClick={() => setSelected(u)}>
            <div>{u.name}</div>
            <div className="muted">{u.email}</div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="uo-drawer">
          <h4>Permissions for {selected.name}</h4>
          <div>-- permission editor will appear here --</div>
        </div>
      )}
    </div>
  );
};

export default UserOverrides;
