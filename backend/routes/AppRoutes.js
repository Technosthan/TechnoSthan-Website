import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../layout/MainLayout";

import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import ServicesPage from "../pages/ServicesPage";
import EngineeringPage from "../pages/EngineeringPage";
import CloudPage from "../pages/CloudPage";
import DigitalGrowthPage from "../pages/DigitalGrowthPage";
import ConsultingPage from "../pages/ConsultingPage";
import ContactPage from "../pages/ContactPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />
      <Route path="/services" element={<MainLayout><ServicesPage /></MainLayout>} />

      {/* Services */}
      <Route path="/engineering" element={<MainLayout><EngineeringPage /></MainLayout>} />
      <Route path="/cloud" element={<MainLayout><CloudPage /></MainLayout>} />
      <Route path="/growth" element={<MainLayout><DigitalGrowthPage /></MainLayout>} />
      <Route path="/consulting" element={<MainLayout><ConsultingPage /></MainLayout>} />

      <Route path="/contact" element={<MainLayout><ContactPage /></MainLayout>} />
    </Routes>
  );
};

export default AppRoutes;