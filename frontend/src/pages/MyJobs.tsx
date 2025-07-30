import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jobsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

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

interface JobApplication {
  id: number;
  job: {
    id: number;
    title: string;
  };
  freelancer: {
    username: string;
  };
  cover_letter: string;
  bid_amount: number | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

const MyJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("jobs");

  const { isAuthenticated, user } = useAuth();
  useEffect(() => {
    fetchMyJobs();
  }, []);
  if (!isAuthenticated || user?.user_type !== "client") {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded">
        You must be logged in as a client to view your jobs.
      </div>
    );
  }



  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getMyJobs();
      setJobs(response.data);

      // Fetch applications for each job
      const appsPromises = response.data.map((job: Job) =>
        jobsAPI.getJobApplications(job.id)
      );

      const appsResponses = await Promise.all(appsPromises);
      const allApplications = appsResponses.flatMap((res) => res.data);
      setApplications(allApplications);
    } catch (err) {
      setError("Failed to fetch your jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    applicationId: number,
    status: "accepted" | "rejected"
  ) => {
    try {
      // Show loading state
      const tempApplications = [...applications];
      const appIndex = tempApplications.findIndex(
        (app) => app.id === applicationId
      );
      if (appIndex !== -1) {
        tempApplications[appIndex].status = status;
        setApplications(tempApplications);
      }

      // Make API call
      await jobsAPI.updateApplicationStatus(applicationId, status);

      // Refresh applications to get the actual server state
      fetchMyJobs();
    } catch (err: any) {
      console.error("Failed to update application status:", err);
      setError(
        "Failed to update application status: " +
          (err.response?.data?.error || "Please try again")
      );

      // Revert the temporary change
      fetchMyJobs();
    }
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
        <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
        <Link to="/post-job" className="btn-primary">
          Post New Job
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded mb-6">{error}</div>
      )}

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "jobs"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}>
            Posted Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "applications"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}>
            Applications ({applications.length})
          </button>
        </nav>
      </div>

      {activeTab === "jobs" ? (
        <div>
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                You haven't posted any jobs yet.
              </p>
              <Link to="/post-job" className="btn-primary mt-4 inline-block">
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div>
              {jobs.map((job) => (
                <div key={job.id} className="card mb-4">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          to={`/jobs/${job.id}`}
                          className="text-xl font-semibold text-blue-600 hover:text-blue-800">
                          {job.title}
                        </Link>
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
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No applications received yet.
              </p>
            </div>
          ) : (
            <div>
              {applications.map((application) => (
                <div key={application.id} className="card mb-4">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {application.freelancer.username}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          Applied on{" "}
                          {new Date(
                            application.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                          application.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : application.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                        {application.status.charAt(0).toUpperCase() +
                          application.status.slice(1)}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700">
                        Cover Letter
                      </h4>
                      <p className="mt-1 text-gray-600 whitespace-pre-line">
                        {application.cover_letter}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between">
                      <div>
                        {application.bid_amount && (
                          <div>
                            <span className="text-gray-500 text-sm">
                              Bid Amount
                            </span>
                            <p className="font-medium">
                              ${application.bid_amount}
                            </p>
                          </div>
                        )}
                      </div>

                      {application.status === "pending" && (
                        <div className="space-x-2">
                          <button
                            onClick={() =>
                              handleUpdateStatus(application.id, "accepted")
                            }
                            className="btn-primary text-sm">
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(application.id, "rejected")
                            }
                            className="btn-danger text-sm">
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyJobs;
