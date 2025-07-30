import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jobsAPI } from "../services/api";

interface Job {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: number | null;
  experience_level: string;
  created_at: string;
  client: {
    username: string;
  };
}

const JobList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const navigate = useNavigate();

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "web-development", label: "Web Development" },
    { value: "mobile-development", label: "Mobile Development" },
    { value: "design", label: "Design" },
    { value: "writing", label: "Writing" },
    { value: "marketing", label: "Marketing" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    fetchJobs();
  }, [categoryFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params =
        categoryFilter !== "all" ? { category: categoryFilter } : {};
      const response = await jobsAPI.getJobs(params);
      setJobs(response.data);
    } catch (err) {
      setError("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (jobId: number) => {
    navigate(`/jobs/${jobId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
        <div className="w-64">
          <select
            className="form-input"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded mb-6">{error}</div>
      )}

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No jobs found</p>
        </div>
      ) : (
        <div>
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => handleJobClick(job.id)}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
              <div className="card mb-4">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-blue-600 hover:text-blue-800">
                        {job.title}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        Posted by {job.client.username}
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {job.category}
                    </span>
                  </div>
                  <p className="mt-3 text-gray-700 line-clamp-2">
                    {job.description}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between">
                    <div className="flex space-x-4">
                      <div>
                        <span className="text-gray-500 text-sm">Budget</span>
                        <p className="font-medium">
                          {job.budget ? `$${job.budget}` : "Negotiable"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-sm">
                          Experience
                        </span>
                        <p className="font-medium capitalize">
                          {job.experience_level}
                        </p>
                      </div>
                    </div>
                    <div className="text-gray-500 text-sm">
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobList;
