import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { apiClient } from "../../../shared/services/apiClient";
import { ROUTES } from "../../../shared/constants/routes";
import { getProgramDetailsPath } from "../../../shared/utils/links";
import { useAuth } from "../../../shared/hooks/useAuth";
import { confirmAdminDelete } from "../../../shared/utils/confirm";

const AdminPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  const loadPrograms = async () => {
    const response = await apiClient.get("/programs");
    setPrograms(response.programs || []);
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const handleDelete = async (id) => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/login", { replace: true });
      return;
    }

    const confirmed = confirmAdminDelete("this program");
    if (!confirmed) {
      return;
    }

    try {
      await apiClient.delete(`/programs/${id}`);
      loadPrograms();
    } catch (error) {
      if (error.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      throw error;
    }
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
                <th>Specialisation</th>
                <th>Type</th>
                <th>Home</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program) => (
                <tr key={program.id}>
                  <td>{program.title}</td>
                  <td>{program.specialisation?.name || "Unassigned"}</td>
                  <td>{program.programType || "-"}</td>
                  <td>{program.showOnHome ? "Yes" : "No"}</td>
                  <td>{program.slug}</td>
                  <td>{program.isActive ? "Active" : "Inactive"}</td>
                  <td className="table-actions">
                    <Link to={getProgramDetailsPath(program)} className="btn btn-secondary">View</Link>
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
