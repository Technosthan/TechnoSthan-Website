import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RouteTransitionShell from "../components/RouteTransitionShell";

const MainLayout = () => {
  return (
    <>
      <Navbar />

      <main>
        <RouteTransitionShell>
          <Outlet />
        </RouteTransitionShell>
      </main>

      <Footer />
    </>
  );
};

export default MainLayout;
