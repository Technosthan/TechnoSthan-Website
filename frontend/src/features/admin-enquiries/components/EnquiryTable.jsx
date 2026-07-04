import StatusBadge from "./StatusBadge";
import Button from "../../../shared/components/Button";

const EnquiryTable = ({ enquiries, onStatusChange, onDelete, loading }) => {
  if (loading) {
    return <p>Loading enquiries...</p>;
  }

  return (
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
                <StatusBadge status={item.status} />
              </td>
              <td>{new Date(item.createdAt).toLocaleDateString()}</td>
              <td>
                <select
                  className="select"
                  value={item.status}
                  onChange={(e) => onStatusChange(item.id, e.target.value)}
                >
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Converted</option>
                  <option>Closed</option>
                </select>
                <Button
                  variant="secondary"
                  style={{ marginTop: "0.5rem" }}
                  onClick={() => onDelete(item.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EnquiryTable;
