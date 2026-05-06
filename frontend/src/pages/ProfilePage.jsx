import { useState, useEffect } from "react";
import {
  getDashboardStats,
  updateProfile,
  sendEmailUpdateOTP,
  verifyEmailUpdateOTP,
} from "../features/dashboard/dashboardApi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [originalData, setOriginalData] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailStep, setEmailStep] = useState("input"); // "input", "otp", "success"
  const [otp, setOtp] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await getDashboardStats();
      const data = {
        name: res.profile.name,
        email: res.profile.email,
      };
      setFormData(data);
      setOriginalData(data);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (formData.name === originalData.name) {
      setMessage("ℹ️ No changes to save");
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ name: formData.name });
      setOriginalData((prev) => ({ ...prev, name: formData.name }));
      setMessage("✅ Name Updated Successfully");
    } catch (err) {
      setMessage("❌ Failed to update name");
    }
    setLoading(false);
  };

  const handleEmailUpdate = async () => {
    if (formData.email === originalData.email) {
      setMessage("ℹ️ Email unchanged");
      return;
    }

    setLoading(true);
    try {
      await sendEmailUpdateOTP(formData.email);
      setPendingEmail(formData.email);
      setEmailStep("otp");
      setMessage("📧 OTP sent to your new email address");
    } catch (err) {
      setMessage("❌ Failed to send OTP");
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setMessage("❌ Please enter OTP");
      return;
    }

    setLoading(true);
    try {
      await verifyEmailUpdateOTP(otp);
      setOriginalData((prev) => ({ ...prev, email: pendingEmail }));
      setFormData((prev) => ({ ...prev, email: pendingEmail }));
      setEmailStep("success");
      setMessage("✅ Email Updated Successfully");
      setOtp("");
      setPendingEmail("");
    } catch (err) {
      setMessage("❌ Invalid OTP");
    }
    setLoading(false);
  };

  const handleCancelEmailUpdate = () => {
    setFormData((prev) => ({ ...prev, email: originalData.email }));
    setEmailStep("input");
    setOtp("");
    setPendingEmail("");
    setMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Navbar />

      <div className="flex-grow max-w-xl mx-auto mt-10 p-6 bg-gray-800 rounded-xl">
        <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

        {/* Name Update Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Update Name</h3>
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className="w-full p-3 rounded bg-gray-700"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 cursor-pointer py-3 rounded disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Name"}
            </button>
          </form>
        </div>

        {/* Email Update Section */}
        <div className="border-t border-gray-600 pt-8">
          <h3 className="text-lg font-semibold mb-4">Update Email</h3>

          {emailStep === "input" && (
            <div className="space-y-4">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-3 rounded bg-gray-700"
              />
              <button
                onClick={handleEmailUpdate}
                disabled={loading || formData.email === originalData.email}
                className="w-full bg-green-500 cursor-pointer py-3 rounded disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Update Email"}
              </button>
            </div>
          )}

          {emailStep === "otp" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-300">
                OTP sent to:{" "}
                <span className="font-semibold">{pendingEmail}</span>
              </p>
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full p-3 rounded bg-gray-700 text-center text-2xl tracking-widest"
                  maxLength="6"
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-500 cursor-pointer py-3 rounded disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEmailUpdate}
                    className="flex-1 bg-gray-600 cursor-pointer py-3 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {emailStep === "success" && (
            <div className="space-y-4">
              <p className="text-green-400 font-semibold">
                ✅ Email updated successfully!
              </p>
              <button
                onClick={() => setEmailStep("input")}
                className="w-full bg-blue-500 cursor-pointer py-3 rounded"
              >
                Update Another Email
              </button>
            </div>
          )}
        </div>

        {message && (
          <div
            className={`mt-4 p-3 rounded ${
              message.includes("✅")
                ? "bg-green-800"
                : message.includes("❌")
                  ? "bg-red-800"
                  : "bg-blue-800"
            }`}
          >
            {message}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
