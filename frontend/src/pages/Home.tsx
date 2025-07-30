import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find the perfect freelance services
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Connect with skilled freelancers for your next project
        </p>

        {!isAuthenticated ? (
          <div className="space-x-4">
            <Link to="/register" className="btn-primary text-lg px-6 py-3">
              Get Started
            </Link>
            <Link to="/jobs" className="btn-secondary text-lg px-6 py-3">
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-x-4">
            <Link to="/jobs" className="btn-primary text-lg px-6 py-3">
              Browse Jobs
            </Link>
            {user?.user_type === "client" && (
              <Link to="/post-job" className="btn-secondary text-lg px-6 py-3">
                Post a Job
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div className="text-center p-6 bg-white rounded-lg shadow">
          <div className="text-4xl mb-4">💼</div>
          <h3 className="text-xl font-semibold mb-2">For Clients</h3>
          <p className="text-gray-600">
            Post jobs and find talented freelancers to complete your projects
          </p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow">
          <div className="text-4xl mb-4">👨‍💻</div>
          <h3 className="text-xl font-semibold mb-2">For Freelancers</h3>
          <p className="text-gray-600">
            Browse jobs and apply to work on exciting projects
          </p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-xl font-semibold mb-2">Fast & Easy</h3>
          <p className="text-gray-600">
            Simple process to connect clients and freelancers quickly
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
