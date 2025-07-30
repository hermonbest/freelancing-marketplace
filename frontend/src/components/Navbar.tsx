import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              FreelanceHub
            </Link>
            <div className="ml-10 flex space-x-4">
              <Link
                to="/jobs"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Browse Jobs
              </Link>
              {isAuthenticated && user?.user_type === "client" && (
                <>
                  <Link
                    to="/post-job"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Post Job
                  </Link>
                  <Link
                    to="/my-jobs"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    My Jobs
                  </Link>
                </>
              )}
              {isAuthenticated && user?.user_type === "freelancer" && (
                <Link
                  to="/my-applications"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  My Applications
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center">
                <span className="text-gray-700 mr-4">
                  Hello, {user?.first_name || user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login" className="btn-secondary text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
