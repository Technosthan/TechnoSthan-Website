import { useEffect, useState } from "react";
import { apiClient } from "../../../shared/services/apiClient";

const Profile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    apiClient.get("/student/profile").then((response) => setProfile(response.user));
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-header"><h1>Profile</h1></div>
      <div className="card glass">
        <p className="muted-copy">{profile?.name}</p>
        <p className="muted-copy">{profile?.email}</p>
        <p className="muted-copy">{profile?.phone}</p>
      </div>
    </div>
  );
};

export default Profile;
