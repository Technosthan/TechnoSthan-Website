import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { apiClient } from "../../../shared/services/apiClient";
import { ROUTES } from "../../../shared/constants/routes";

const AdminPrograms = () => {
  const [programs, setPrograms] = useState([]);

  const loadPrograms = async () => {
    const response = await apiClient.get("/programs");
    setPrograms(response.programs || []);
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const handleDelete = async (id) => {
    await apiClient.delete(`/programs/${id}`);
    loadPrograms();
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Programs</h1>
        <Link className="btn btn-primary" to={ROUTES.ADMIN_PROGRAM_NEW}><Plus size={16} /> New program</Link>
      </div>
      <div className="card glass table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program) => (
                <tr key={program.id}>
                  <td>{program.title}</td>
                  <td>{program.slug}</td>
                  <td>{program.isActive ? "Active" : "Inactive"}</td>
                  <td className="table-actions">
                    <Link to={`/programs/${program.slug}`} className="btn btn-secondary">View</Link>
                    <Link to={`/admin/programs/${program.id}/edit`} className="btn btn-secondary">Edit</Link>
                    <button className="btn btn-secondary" onClick={() => handleDelete(program.id)}>Delete</button>
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

export default AdminPrograms;
