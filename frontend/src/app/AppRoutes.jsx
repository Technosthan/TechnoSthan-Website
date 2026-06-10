import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../shared/layouts/MainLayout";

import HomePage from "../features/home/pages/HomePage";
import AboutPage from "../features/about/pages/AboutPage";
import ServicesPage from "../features/services/pages/ServicesPage";
import PortfolioPage from "../features/portfolio/pages/PortfolioPage";
import ContactPage from "../features/contact/pages/ContactPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;