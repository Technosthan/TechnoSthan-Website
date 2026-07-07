import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CampaignPopup from "./features/campaigns/components/CampaignPopup";

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <CampaignPopup />
      <Footer />
    </div>
  );
}

export default App;
