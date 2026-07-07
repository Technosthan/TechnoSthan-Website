import { useEffect, useState } from "react";
import { CalendarDays, IndianRupee, Users } from "lucide-react";
import { apiClient } from "../../../shared/services/apiClient";
import SectionHeader from "../../../shared/components/SectionHeader";
import { getMediaUrl } from "../../../shared/utils/media";

const Workshops = () => {
  const [workshops, setWorkshops] = useState([]);

  useEffect(() => {
    apiClient.get("/workshops").then((response) => setWorkshops(response.workshops || []));
  }, []);

  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Workshops"
          title="Live workshops and hands-on sessions"
          description="Browse active workshops, see available seats, and enroll from the public site."
        />
        {workshops.length ? (
          <div className="grid cards-grid-3">
            {workshops.map((workshop) => (
              <article key={workshop.id} className="card glass workshop-card">
                {workshop.thumbnailUrl ? <img className="campaign-media" src={getMediaUrl(workshop.thumbnailUrl, "image")} alt={workshop.title} /> : null}
                <p className="badge">{workshop.mode}</p>
                <h3>{workshop.title}</h3>
                <p className="muted-copy">{workshop.description}</p>
                <div className="workshop-meta-row">
                  <span><CalendarDays size={14} /> {workshop.date ? new Date(workshop.date).toLocaleDateString("en-IN") : "Upcoming"}</span>
                  <span><Users size={14} /> Seats left: {workshop.seatsLeft ?? workshop.seats ?? "N/A"}</span>
                  <span><IndianRupee size={14} /> {workshop.fees}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="card glass empty-state">No workshops available right now.</div>
        )}
      </div>
    </section>
  );
};

export default Workshops;
