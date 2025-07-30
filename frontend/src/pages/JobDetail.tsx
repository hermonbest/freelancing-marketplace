import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jobsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface Job {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: number | null;
  experience_level: string;
  is_fixed_price: boolean;
  deadline: string | null;
  created_at: string;
  client: {
    username: string;
    first_name: string;
    last_name: string;
  };
}

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchJob(parseInt(id));
    }
  }, [id]);

  const fetchJob = async (jobId: number) => {
    try {
      setLoading(true);
      const response = await jobsAPI.getJob(jobId);
      setJob(response.data);
    } catch (err) {
      setError("Failed to fetch job details");
    } finally {
      setLoading(false);
    }
  };

const handleApply = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!isAuthenticated) {
    navigate('/login');
    return;
  }
  
  if (user?.user_type !== 'freelancer') {
    setApplyError('Only freelancers can apply to jobs');
    return;
  }
  
  setIsApplying(true);
  setApplyError('');
  
  try {
    // Prepare the data correctly
    const applicationData = {
      cover_letter: coverLetter,
      bid_amount: bidAmount ? parseFloat(bidAmount) : null,
    };
    
    console.log('Sending application data:', applicationData); // For debugging
    
    await jobsAPI.applyToJob(job!.id, applicationData);
    setApplySuccess(true);
    setShowApplyForm(false);
    setCoverLetter('');
    setBidAmount('');
  } catch (err: any) {
    console.error('Application error:', err);
    const errorMessage = err.response?.data?.cover_letter || 
                        err.response?.data?.bid_amount ||
                        err.response?.data?.error ||
                        'Failed to submit application. Please try again.';
    setApplyError(errorMessage);
  } finally {
    setIsApplying(false);
  }
  }
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded">
        {error || "Job not found"}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-gray-600 mt-2">
                Posted by {job.client.first_name} {job.client.last_name} (
                {job.client.username})
              </p>
            </div>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
              {job.category}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-gray-500 text-sm">Experience Level</h3>
              <p className="font-medium capitalize">{job.experience_level}</p>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Budget</h3>
              <p className="font-medium">
                {job.budget ? `$${job.budget}` : "Negotiable"}
              </p>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Deadline</h3>
              <p className="font-medium">{formatDate(job.deadline)}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">
              {job.description}
            </p>
          </div>

          <div className="mt-8">
            {isAuthenticated &&
            user?.user_type === "freelancer" &&
            !applySuccess ? (
              <div>
                {showApplyForm ? (
                  <form onSubmit={handleApply} className="border-t pt-6">
                    {applyError && (
                      <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
                        {applyError}
                      </div>
                    )}

                    <div className="mb-4">
                      <label
                        htmlFor="coverLetter"
                        className="block text-gray-700 mb-2">
                        Cover Letter
                      </label>
                      <textarea
                        id="coverLetter"
                        className="form-input"
                        rows={5}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <label
                        htmlFor="bidAmount"
                        className="block text-gray-700 mb-2">
                        Bid Amount (optional)
                      </label>
                      <input
                        type="number"
                        id="bidAmount"
                        className="form-input"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={isApplying}>
                        {isApplying ? "Submitting..." : "Submit Application"}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowApplyForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowApplyForm(true)}
                    className="btn-primary">
                    Apply for this Job
                  </button>
                )}
              </div>
            ) : isAuthenticated &&
              user?.user_type === "client" &&
              user.username === job.client.username ? (
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-blue-800">
                  You posted this job.{" "}
                  <a href="/my-jobs" className="underline">
                    View all your jobs
                  </a>
                  .
                </p>
              </div>
            ) : applySuccess ? (
              <div className="bg-green-50 p-4 rounded">
                <p className="text-green-800">
                  Your application has been submitted successfully!
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-700">
                  <a href="/login" className="text-blue-600 hover:underline">
                    Log in
                  </a>{" "}
                  as a freelancer to apply for this job.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
