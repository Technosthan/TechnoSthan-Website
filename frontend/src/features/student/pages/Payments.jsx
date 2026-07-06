import { useEffect, useState } from "react";
import { apiClient } from "../../../shared/services/apiClient";

const Payments = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    apiClient.get("/student/payments").then((response) => setPayments(response.payments || []));
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-header"><h1>Payment history</h1></div>
      <div className="grid cards-grid-2">
        {payments.map((payment) => (
          <article key={payment.id} className="card glass">
            <p className="badge">{payment.status}</p>
            <h3>{payment.program?.title}</h3>
            <p className="muted-copy">₹{Number(payment.amount).toLocaleString("en-IN")}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Payments;
