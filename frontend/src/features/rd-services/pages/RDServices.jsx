import { Microscope, Rocket, Sparkles } from "lucide-react";
import SectionHeader from "../../../shared/components/SectionHeader";
import RDServiceCard from "../components/RDServiceCard";
import { rdServicesData } from "../data/rdServicesData";

const RDServices = () => {
  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          // eyebrow="R&D Services"
          title="Research, prototyping, and product innovation support"
          // description="From ideation to deployment, we help teams move from concept to implementation with confidence."
        />
        {/* <div className="page-hero-card glass">
          <div>
            <p className="badge">Innovation Lab</p>
            <h3>From concept to deployment with measurable outcomes.</h3>
            <p>
              We help founders, educators, and teams validate, build, and launch
              faster.
            </p>
          </div>
          <div className="page-pill-stack">
            <span className="page-pill">
              <Microscope size={14} /> Validation
            </span>
            <span className="page-pill">
              <Rocket size={14} /> Launch Ready
            </span>
            <span className="page-pill">
              <Sparkles size={14} /> Product Growth
            </span>
          </div>
        </div> */}
        <div className="grid cards-grid-3">
          {rdServicesData.map((service) => (
            <RDServiceCard key={service.title} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RDServices;
