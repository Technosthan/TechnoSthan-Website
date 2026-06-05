import React from "react";
import GlobalServices from "./GlobalServices";
import RolePermissions from "./RolePermissions";
import UserOverrides from "./UserOverrides";
import PermissionInsights from "./PermissionInsights";
import "./WorkspaceServicesUI.css";

const WorkspaceServicesUI = () => {
  return (
    <div className="ws-container">
      <div className="ws-main">
        <section className="ws-section">
          <h2 className="ws-section-title">Global Workspace Services</h2>
          <GlobalServices />
        </section>

        <section className="ws-section">
          <h2 className="ws-section-title">Role Permission Control</h2>
          <RolePermissions />
        </section>

        <section className="ws-section">
          <h2 className="ws-section-title">User Permission Overrides</h2>
          <UserOverrides />
        </section>
      </div>

      <aside className="ws-insights">
        <PermissionInsights />
      </aside>
    </div>
  );
};

export default WorkspaceServicesUI;
