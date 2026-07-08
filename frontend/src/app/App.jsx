import { Outlet } from "react-router-dom";
import MainLayout from "../shared/layouts/MainLayout";
import CampaignPopup from "../features/campaigns/components/CampaignPopup";

function App() {
  return (
    <MainLayout>
      <Outlet />
      <CampaignPopup />
    </MainLayout>
  );
}

export default App;
