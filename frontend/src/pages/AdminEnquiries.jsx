import { useEffect, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import { api } from "../services/api";

const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      const data = await api.getEnquiries();
      setEnquiries(data.enquiries || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.updateEnquiryStatus(id, status);
      await loadEnquiries();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteEnquiry(id);
      await loadEnquiries();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Admin"
          title="Enquiry Dashboard"
          description="Manage incoming enquiries, update status, and keep follow-ups organized."
        />
        {error && <p style={{ color: "#f87171" }}>{error}</p>}
        {loading ? (
          <p>Loading enquiries...</p>
        ) : (
          <div className="card glass table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Category</th>
                  <th>Interested Area</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((item) => (
                  <tr key={item.id}>
                    <td>{item.fullName}</td>
                    <td>{item.email}</td>
                    <td>{item.phone}</td>
                    <td>{item.category}</td>
                    <td>{item.interestedArea}</td>
                    <td>{item.message}</td>
                    <td>
                      <span
                        className={`badge status-${item.status.toLowerCase()}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        className="select"
                        value={item.status}
                        onChange={(e) =>
                          handleStatusChange(item.id, e.target.value)
                        }
                      >
                        <option>New</option>
                        <option>Contacted</option>
                        <option>Converted</option>
                        <option>Closed</option>
                      </select>
                      <button
                        className="btn btn-secondary"
                        style={{ marginTop: "0.5rem" }}
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminEnquiries;
