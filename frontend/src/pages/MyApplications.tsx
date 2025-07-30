import React, { useState, useEffect } from "react";
import { jobsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

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

const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { isAuthenticated, user } = useAuth();
  useEffect(() => {
    fetchMyApplications();
  }, []);
  
  if (!isAuthenticated || user?.user_type !== "freelancer") {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded">
        You must be logged in as a freelancer to view your applications.
      </div>
    );
  }



  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getMyApplications();
      setApplications(response.data);
    } catch (err) {
      setError("Failed to fetch your applications");
    } finally {
      setLoading(false);
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Applications</h1>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded mb-6">{error}</div>
      )}

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            You haven't applied to any jobs yet.
          </p>
        </div>
      ) : (
        <div>
          {applications.map((application) => (
            <div key={application.id} className="card mb-4">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      to={`/jobs/${application.job.id}`}
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800">
                      {application.job.title}
                    </Link>

                    <p className="text-gray-600 mt-1">
                      Applied on{" "}
                      {new Date(application.created_at).toLocaleDateString()}
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
                  <h4 className="font-medium text-gray-700">Cover Letter</h4>
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
                        <p className="font-medium">${application.bid_amount}</p>
                      </div>
                    )}
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

export default MyApplications;
