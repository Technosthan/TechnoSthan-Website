import { useLocation } from "react-router-dom";
import { useWorkspaceAccess } from "../../context/WorkspaceAccessContext";
import FeatureBlocked from "./FeatureBlocked";
import ProtectedRoute from "./ProtectedRoute";

const FeatureRoute = ({
  children,
  featureKey,
  blockedTitle,
  blockedMessage,
}) => {
  const location = useLocation();
  const { loading, getFeatureAccess } = useWorkspaceAccess();
  const feature = getFeatureAccess(featureKey);

  return (
    <ProtectedRoute>
      {loading ? (
        <FeatureBlocked
          title="Loading workspace access"
          message={`Checking availability for ${location.pathname}.`}
        />
      ) : feature?.allowed ? (
        children
      ) : (
        <FeatureBlocked
          title={blockedTitle}
          message={blockedMessage}
        />
      )}
    </ProtectedRoute>
  );
};

export default FeatureRoute;
