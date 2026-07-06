import { useEffect, useState } from "react";
import { apiClient } from "../../../shared/services/apiClient";

const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);

  const load = async () => {
    const response = await apiClient.get("/enquiries");
    setEnquiries(response.enquiries || []);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await apiClient.patch(`/admin/enquiries/${id}/status`, { status });
    load();
  };

  return (
    <div className="dashboard-page">
      <div className="page-header"><h1>Enquiries</h1></div>
      <div className="card glass table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Area</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enquiry) => (
                <tr key={enquiry.id}>
                  <td>{enquiry.fullName}</td>
                  <td>{enquiry.email}</td>
                  <td>{enquiry.interestedArea}</td>
                  <td>{enquiry.status}</td>
                  <td className="table-actions">
                    <button className="btn btn-secondary" onClick={() => updateStatus(enquiry.id, "Contacted")}>Contacted</button>
                    <button className="btn btn-secondary" onClick={() => updateStatus(enquiry.id, "Converted")}>Converted</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminEnquiries;
