import React, { useEffect, useState } from "react";
import api from "../../lib/api";

const RolePermissions = () => {
  const [role, setRole] = useState("HR");
  const [perms, setPerms] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(
          `/api/admin/workspace-services/roles/${role}`,
        );
        setPerms(data?.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [role]);

  return (
    <div className="rp-wrap">
      <div className="rp-tabs">
        <button
          onClick={() => setRole("HR")}
          className={role === "HR" ? "active" : ""}
        >
          HR
        </button>
        <button
          onClick={() => setRole("USER")}
          className={role === "USER" ? "active" : ""}
        >
          USER
        </button>
      </div>

      <div className="rp-list">
        {perms.map((p) => (
          <div key={p.key} className="rp-item">
            <div className="rp-name">{p.key}</div>
            <div className="rp-toggle">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(p.roleAllowed)}
                  readOnly
                />
                <span className="slider" />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RolePermissions;
