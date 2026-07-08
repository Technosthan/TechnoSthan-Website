const Support = () => {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <p className="badge">Student portal</p>
          <h1>Support</h1>
        </div>
      </div>

      <div className="card glass student-support-card">
        <h3>Need help with a program, payment, or mentor follow-up?</h3>
        <p className="muted-copy">
          Reach out to the support team or your assigned mentor through the contact channels shared in your course dashboard.
        </p>
        <div className="program-meta">
          <span className="meta-pill">support@technosthan.com</span>
          <span className="meta-pill">+91 94777-288-288</span>
        </div>
      </div>
    </div>
  );
};

export default Support;
