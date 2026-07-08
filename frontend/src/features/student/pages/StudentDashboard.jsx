import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, CreditCard, GraduationCap, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { apiClient } from "../../../shared/services/apiClient";
import { getProgramDetailsPath } from "../../../shared/utils/links";

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [workshops, setWorkshops] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileResponse, programsResponse, workshopsResponse] = await Promise.allSettled([
          apiClient.get("/student/profile"),
          apiClient.get("/programs/home"),
          apiClient.get("/workshops"),
        ]);

        if (profileResponse.status === "fulfilled") {
          setProfile(profileResponse.value.user || null);
        }
        if (programsResponse.status === "fulfilled") {
          setPrograms(programsResponse.value.programs || []);
        }
        if (workshopsResponse.status === "fulfilled") {
          setWorkshops(workshopsResponse.value.workshops || []);
        }
      } catch (_error) {
        setProfile(null);
        setPrograms([]);
        setWorkshops([]);
      }
    };

    load();
  }, []);

  const enrollments = profile?.enrollments || [];
  const payments = profile?.payments || [];

  const activeEnrollments = useMemo(
    () => enrollments.filter((enrollment) => enrollment.status === "ACTIVE"),
    [enrollments],
  );
  const completedEnrollments = useMemo(
    () => enrollments.filter((enrollment) => enrollment.status === "COMPLETED"),
    [enrollments],
  );
  const pendingPayments = useMemo(
    () => enrollments.filter((enrollment) => enrollment.paymentStatus === "PENDING"),
    [enrollments],
  );

  const currentProgram = activeEnrollments[0] || enrollments[0] || null;
  const enrolledProgramIds = new Set(enrollments.map((enrollment) => enrollment.programId));
  const recommendedPrograms = programs.filter((program) => !enrolledProgramIds.has(program.id)).slice(0, 3);
  const upcomingWorkshops = workshops.slice(0, 3);
  const recentPayments = payments.slice(0, 4);
  const certificateCount = completedEnrollments.length;

  const cards = [
    { label: "Enrolled Programs", value: enrollments.length, icon: Layers3 },
    { label: "Active Programs", value: activeEnrollments.length, icon: Sparkles },
    { label: "Completed Programs", value: completedEnrollments.length, icon: GraduationCap },
    { label: "Certificates", value: certificateCount, icon: ShieldCheck },
    { label: "Pending Payments", value: pendingPayments.length, icon: CreditCard },
    { label: "Upcoming Workshops", value: upcomingWorkshops.length, icon: CalendarDays },
  ];

  return (
    <div className="dashboard-page student-dashboard-page">
      <div className="page-header student-dashboard-header">
        <div>
          <p className="badge">Student dashboard</p>
          <h1>Welcome back, {profile?.name || "student"}</h1>
          <p className="muted-copy">Your learning progress, programs, workshops, and support activity live here.</p>
        </div>
        <Link to="/programs" className="btn btn-secondary">
          Browse programs <ArrowRight size={16} />
        </Link>
      </div>

      <div className="dashboard-metrics student-metrics">
        {cards.map((card) => (
          <div key={card.label} className="card glass metric-card student-metric-card">
            <span className="metric-icon">
              <card.icon size={18} />
            </span>
            <strong>{card.value}</strong>
            <span>{card.label}</span>
          </div>
        ))}
      </div>

      <div className="student-dashboard-grid">
        <section className="card glass student-feature-card">
          <div className="student-section-head">
            <div>
              <p className="badge">My Current Program</p>
              <h2>{currentProgram?.program?.title || "No program enrolled yet"}</h2>
            </div>
          </div>
          {currentProgram?.program ? (
            <>
              <p className="muted-copy">{currentProgram.program.shortDescription}</p>
              <div className="program-meta">
                <span className="meta-pill">{currentProgram.status}</span>
                <span className="meta-pill">{currentProgram.paymentStatus}</span>
                <span className="meta-pill">{currentProgram.program.duration}</span>
              </div>
              <Link to={getProgramDetailsPath(currentProgram.program)} className="btn btn-primary">
                Open program <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            <p className="muted-copy">Enroll in a program to track your learning journey here.</p>
          )}
        </section>

        <section className="card glass student-feature-card">
          <div className="student-section-head">
            <div>
              <p className="badge">Recommended Programs</p>
              <h2>Next best options for your growth</h2>
            </div>
          </div>
          <div className="student-stack">
            {recommendedPrograms.length ? (
              recommendedPrograms.map((program) => (
                <article key={program.id} className="student-list-item">
                  <div>
                    <h3>{program.title}</h3>
                    <p className="muted-copy">{program.shortDescription}</p>
                  </div>
                  <Link to={getProgramDetailsPath(program)} className="btn btn-secondary btn-sm">
                    View
                  </Link>
                </article>
              ))
            ) : (
              <p className="muted-copy">Recommended programs will appear after you enroll in one track.</p>
            )}
          </div>
        </section>

        <section className="card glass student-feature-card">
          <div className="student-section-head">
            <div>
              <p className="badge">Upcoming Workshops</p>
              <h2>Live sessions and short sprints</h2>
            </div>
          </div>
          <div className="student-stack">
            {upcomingWorkshops.length ? (
              upcomingWorkshops.map((workshop) => (
                <article key={workshop.id} className="student-list-item">
                  <div>
                    <h3>{workshop.title}</h3>
                    <p className="muted-copy">{workshop.description}</p>
                  </div>
                  <span className="meta-pill">
                    {workshop.date ? new Date(workshop.date).toLocaleDateString("en-IN") : "Upcoming"}
                  </span>
                </article>
              ))
            ) : (
              <p className="muted-copy">No workshops are scheduled right now.</p>
            )}
          </div>
        </section>

        <section className="card glass student-feature-card">
          <div className="student-section-head">
            <div>
              <p className="badge">Payment History</p>
              <h2>Recent transactions</h2>
            </div>
          </div>
          <div className="student-stack">
            {recentPayments.length ? (
              recentPayments.map((payment) => (
                <article key={payment.id} className="student-list-item">
                  <div>
                    <h3>{payment.program?.title}</h3>
                    <p className="muted-copy">{payment.status}</p>
                  </div>
                  <span className="meta-pill">Rs. {Number(payment.amount).toLocaleString("en-IN")}</span>
                </article>
              ))
            ) : (
              <p className="muted-copy">Your payment history will appear after your first enrollment.</p>
            )}
          </div>
        </section>

        <section className="card glass student-feature-card">
          <div className="student-section-head">
            <div>
              <p className="badge">Certificates</p>
              <h2>Completion and achievements</h2>
            </div>
          </div>
          <div className="student-stack">
            {completedEnrollments.length ? (
              completedEnrollments.map((enrollment) => (
                <article key={enrollment.id} className="student-list-item">
                  <div>
                    <h3>{enrollment.program?.title}</h3>
                    <p className="muted-copy">
                      Completed on{" "}
                      {enrollment.completedAt ? new Date(enrollment.completedAt).toLocaleDateString("en-IN") : "recently"}
                    </p>
                  </div>
                  <span className="meta-pill">Certificate ready</span>
                </article>
              ))
            ) : (
              <p className="muted-copy">Certificates unlock once you complete a program.</p>
            )}
          </div>
        </section>

        <section className="card glass student-feature-card student-support-card">
          <div className="student-section-head">
            <div>
              <p className="badge">Support / Contact Mentor</p>
              <h2>We're here when you need help</h2>
            </div>
          </div>
          <p className="muted-copy">
            Use the support menu or contact your mentor for guidance on coursework, payments, and outcomes.
          </p>
          <div className="program-meta">
            <span className="meta-pill">support@technosthan.com</span>
            <span className="meta-pill">+91 94777-288-288</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;
