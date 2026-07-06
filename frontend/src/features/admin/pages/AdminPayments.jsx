import { useEffect, useState } from "react";
import { apiClient } from "../../../shared/services/apiClient";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    apiClient.get("/admin/payments").then((response) => setPayments(response.payments || []));
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-header"><h1>Payments</h1></div>
      <div className="card glass table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Program</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.user?.name}</td>
                  <td>{payment.program?.title}</td>
                  <td>{Number(payment.amount).toLocaleString("en-IN")}</td>
                  <td>{payment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
