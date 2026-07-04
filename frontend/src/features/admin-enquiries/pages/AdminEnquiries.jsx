import { useEffect, useState } from "react";
import SectionHeader from "../../../shared/components/SectionHeader";
import EnquiryTable from "../components/EnquiryTable";
import {
  deleteEnquiry,
  getEnquiries,
  updateEnquiryStatus,
} from "../services/enquiryService";

const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      const data = await getEnquiries();
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
      await updateEnquiryStatus(id, status);
      await loadEnquiries();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEnquiry(id);
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
        <EnquiryTable
          enquiries={enquiries}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </section>
  );
};

export default AdminEnquiries;
