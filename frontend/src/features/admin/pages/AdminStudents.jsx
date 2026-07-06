import { useEffect, useState } from "react";
import { apiClient } from "../../../shared/services/apiClient";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    apiClient.get("/admin/students").then((response) => setStudents(response.students || []));
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-header"><h1>Students</h1></div>
      <div className="card glass table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Programs</th>
                <th>Payments</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.enrollments?.length || 0}</td>
                  <td>{student.payments?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminStudents;
