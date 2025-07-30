import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jobsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const PostJob: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "web-development",
    budget: "",
    is_fixed_price: true,
    experience_level: "entry",
    deadline: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || user?.user_type !== "client") {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded">
        You must be logged in as a client to post jobs.
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Prepare data for submission
      const jobData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        experience_level: formData.experience_level,
        is_fixed_price: formData.is_fixed_price,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        deadline: formData.deadline || null,
      };

      console.log("Sending job data:", jobData); // For debugging

      await jobsAPI.createJob(jobData);
      setSuccess(true);

      // Reset form after successful submission
      setFormData({
        title: "",
        description: "",
        category: "web-development",
        budget: "",
        is_fixed_price: true,
        experience_level: "entry",
        deadline: "",
      });

      // Redirect to my jobs after 2 seconds
      setTimeout(() => navigate("/my-jobs"), 2000);
    } catch (err: any) {
      console.error("Job posting error:", err);
      const errorMessage =
        err.response?.data?.title ||
        err.response?.data?.description ||
        err.response?.data?.category ||
        err.response?.data?.experience_level ||
        "Failed to post job. Please check all fields and try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Post a New Job</h2>

          {success && (
            <div className="bg-green-50 text-green-700 p-3 rounded mb-4">
              Job posted successfully!
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-input"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                className="form-input"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="category" className="block text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  className="form-input"
                  value={formData.category}
                  onChange={handleChange}
                  required>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-development">Mobile Development</option>
                  <option value="design">Design</option>
                  <option value="writing">Writing</option>
                  <option value="marketing">Marketing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="experience_level"
                  className="block text-gray-700 mb-2">
                  Experience Level *
                </label>
                <select
                  id="experience_level"
                  name="experience_level"
                  className="form-input"
                  value={formData.experience_level}
                  onChange={handleChange}
                  required>
                  <option value="entry">Entry Level</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="budget" className="block text-gray-700 mb-2">
                Budget (optional)
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                className="form-input"
                value={formData.budget}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Enter amount in USD"
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_fixed_price"
                  className="rounded text-blue-600"
                  checked={formData.is_fixed_price}
                  onChange={handleChange}
                />
                <span className="ml-2 text-gray-700">Fixed Price Job</span>
              </label>
            </div>

            <div className="mb-6">
              <label htmlFor="deadline" className="block text-gray-700 mb-2">
                Deadline (optional)
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                className="form-input"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Posting..." : "Post Job"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
