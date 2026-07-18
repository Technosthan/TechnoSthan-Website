import { useEffect, useMemo, useState } from "react";
import {
  FiMail,
  FiMessageSquare,
  FiUsers,
  FiTarget,
  FiCalendar,
} from "react-icons/fi";

import { getAdminLeads } from "../../../api/leads.api";

const LeadsPage = () => {
  const [data, setData] = useState({
    contacts: [],
    inquiries: [],
    subscribers: [],
    totals: {
      contacts: 0,
      inquiries: 0,
      subscribers: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await getAdminLeads();
        if (!mounted) return;
        setData(response.data?.data || {
          contacts: [],
          inquiries: [],
          subscribers: [],
          totals: { contacts: 0, inquiries: 0, subscribers: 0 },
        });
      } catch (err) {
        if (!mounted) return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load leads."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(
    () => [
      { label: "Contact form", value: data.totals.contacts, icon: FiMessageSquare },
      { label: "Inquiry form", value: data.totals.inquiries, icon: FiTarget },
      { label: "Subscribers", value: data.totals.subscribers, icon: FiUsers },
    ],
    [data.totals]
  );

  return (
    <div className="admin-page">
      <section className="admin-card">
        <span className="section-badge">
          <span className="badge-dot" />
          Leads CMS
        </span>
        <h2>Lead and inquiry overview</h2>
        <p className="admin-note">
          This dashboard surfaces contacts, inquiries, and subscribers from the
          live database so business follow-up can stay organized.
        </p>
      </section>

      {loading ? (
        <div className="admin-loading">Loading leads overview...</div>
      ) : error ? (
        <div className="admin-error">{error}</div>
      ) : (
        <>
          <div className="admin-trust-grid">
            {summary.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="admin-trust-card">
                  <Icon />
                  <strong>{item.label}</strong>
                  <span>{item.value}</span>
                </div>
              );
            })}
          </div>

          <section className="admin-card">
            <div className="admin-section-title">
              <div>
                <h3>Recent contacts</h3>
                <p className="admin-note">
                  Latest submissions from the public contact form.
                </p>
              </div>
            </div>

            <div className="admin-feature-list">
              {data.contacts.slice(0, 5).map((item) => (
                <article key={item.id} className="admin-feature-item">
                  <div>
                    <h4>{item.name}</h4>
                    <p>{item.company || "No company specified"}</p>
                    <p className="admin-note">{item.email}</p>
                  </div>
                  <div className="admin-note">
                    <FiCalendar />
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </article>
              ))}
              {data.contacts.length === 0 ? (
                <div className="admin-empty">No contact submissions yet.</div>
              ) : null}
            </div>
          </section>

          <section className="admin-card">
            <div className="admin-section-title">
              <div>
                <h3>Recent inquiries</h3>
                <p className="admin-note">
                  Lead form submissions captured from the inquiry flow.
                </p>
              </div>
            </div>

            <div className="admin-feature-list">
              {data.inquiries.slice(0, 5).map((item) => (
                <article key={item.id} className="admin-feature-item">
                  <div>
                    <h4>{item.name}</h4>
                    <p>{item.service || "General inquiry"}</p>
                    <p className="admin-note">{item.message}</p>
                  </div>
                  <div className="admin-note">
                    <FiCalendar />
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </article>
              ))}
              {data.inquiries.length === 0 ? (
                <div className="admin-empty">No inquiries yet.</div>
              ) : null}
            </div>
          </section>

          <section className="admin-card">
            <div className="admin-section-title">
              <div>
                <h3>Latest subscribers</h3>
                <p className="admin-note">
                  Newsletter signups and updates from the public site.
                </p>
              </div>
            </div>

            <div className="admin-feature-list">
              {data.subscribers.slice(0, 5).map((item) => (
                <article key={item.id} className="admin-feature-item">
                  <div>
                    <h4>{item.email}</h4>
                    <p className="admin-note">Subscriber</p>
                  </div>
                  <div className="admin-note">
                    <FiMail />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </article>
              ))}
              {data.subscribers.length === 0 ? (
                <div className="admin-empty">No subscribers yet.</div>
              ) : null}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default LeadsPage;
