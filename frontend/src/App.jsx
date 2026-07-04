import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import RDServices from "./pages/RDServices";
import SkillPrograms from "./pages/SkillPrograms";
import StartupSupport from "./pages/StartupSupport";
import Industries from "./pages/Industries";
import Contact from "./pages/Contact";
import AdminEnquiries from "./pages/AdminEnquiries";

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/rd-services" element={<RDServices />} />
          <Route path="/skill-programs" element={<SkillPrograms />} />
          <Route path="/startup-support" element={<StartupSupport />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<AdminEnquiries />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
