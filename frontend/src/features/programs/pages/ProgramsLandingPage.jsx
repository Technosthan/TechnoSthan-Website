import { useEffect, useState } from "react";
import { ArrowRight, Layers3, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeader from "../../../shared/components/SectionHeader";
import { apiClient } from "../../../shared/services/apiClient";
import { getSpecialisationProgramsPath } from "../../../shared/utils/links";
import { getMediaUrl } from "../../../shared/utils/media";
import { mergeDefaultSpecialisations } from "../../../shared/data/defaultSpecialisations";

const ProgramsLandingPage = () => {
  const [specialisations, setSpecialisations] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await apiClient.get("/specialisations");
        setSpecialisations(mergeDefaultSpecialisations(response.specialisations || []));
      } catch (_error) {
        setSpecialisations(mergeDefaultSpecialisations([]));
      }
    };

    load();
  }, []);

  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Programs"
          title="Choose your specialisation"
          description="Innovation Hub programs are organised by clear learning tracks so learners can move from interest to outcome with focus."
        />

        <div className="programs-intro card glass">
          <div>
            <p className="badge">Innovation Hub Specialisations</p>
            <h3>Explore Techno or AgroSthan and open the program pathways inside each track.</h3>
            <p className="muted-copy">
              Each specialisation groups multiple programs, workshops, certifications, and project paths.
            </p>
          </div>
          <div className="page-pill-stack">
            <span className="page-pill">
              <Layers3 size={14} /> Specialisation-first structure
            </span>
            <span className="page-pill">
              <Sparkles size={14} /> Focused filters
            </span>
          </div>
        </div>

        {specialisations.length ? (
          <div className="grid programs-specialisation-grid">
            {specialisations.map((specialisation) => (
              <article key={specialisation.id} className="card glass specialisation-card">
                {specialisation.bannerImageUrl ? (
                  <img
                    className="specialisation-banner"
                    src={getMediaUrl(specialisation.bannerImageUrl, "image")}
                    alt={specialisation.name}
                  />
                ) : null}
                <div className="specialisation-card-body">
                  <p className="badge">{specialisation.name}</p>
                  <h3>{specialisation.shortDescription || specialisation.description}</h3>
                  <p className="muted-copy">{specialisation.description}</p>
                  <div className="program-meta">
                    <span className="meta-pill">{specialisation.programs?.length || 0} programs</span>
                  </div>
                  <Link className="btn btn-primary" to={getSpecialisationProgramsPath(specialisation.slug)}>
                    View programs <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="card glass empty-state">No specialisations available right now.</div>
        )}
      </div>
    </section>
  );
};

export default ProgramsLandingPage;
