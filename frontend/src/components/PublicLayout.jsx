import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingThemeSelector from "./FloatingThemeSelector";
import { PublicLayoutProvider } from "../contexts/PublicLayoutContext";

const PublicLayout = () => {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <Navbar />

      <PublicLayoutProvider value={true}>
        <main className="flex-1">
          <Outlet />
        </main>
      </PublicLayoutProvider>

      <Footer />
      <FloatingThemeSelector />
    </div>
  );
};

export default PublicLayout;
