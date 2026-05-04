import { useState, useEffect } from "react";
import { getDashboardStats, updateProfile } from "../features/dashboard/dashboardApi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await getDashboardStats();
      setFormData({
        name: res.profile.name,
        email: res.profile.email,
      });
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      setMessage("✅ Profile Updated Successfully");
    } catch (err) {
      setMessage("❌ Failed to update");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Navbar />
      

     <div className="flex-grow max-w-xl mx-auto mt-10 p-6 bg-gray-800 rounded-xl">
        <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full p-3 rounded bg-gray-700"
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-3 rounded bg-gray-700"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 py-3 rounded"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </form>

        {message && <p className="mt-4">{message}</p>}
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;