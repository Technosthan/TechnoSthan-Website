import { Rocket, Sparkles, TrendingUp } from "lucide-react";
import SectionHeader from "../../../shared/components/SectionHeader";
import StartupCard from "../components/StartupCard";
import { startupData } from "../data/startupData";

const StartupSupport = () => {
  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          // eyebrow="Startup Support"
          title="Support that helps ideas become impact"
          // description="We guide startups from concept to commercialization with strategic, technical, and business assistance."
        />
        {/* <div className="page-hero-card glass">
          <div>
            <p className="badge">Founder Growth</p>
            <h3>
              A guided journey from idea validation to market-ready execution.
            </h3>
            <p>
              Our support is tailored to help founders build confidently and
              move faster.
            </p>
          </div>
          <div className="page-pill-stack">
            <span className="page-pill">
              <Rocket size={14} /> Launch
            </span>
            <span className="page-pill">
              <TrendingUp size={14} /> Scale
            </span>
            <span className="page-pill">
              <Sparkles size={14} /> Innovation
            </span>
          </div>
        </div> */}
        <div className="grid cards-grid-3">
          {startupData.map((item) => (
            <StartupCard key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StartupSupport;
