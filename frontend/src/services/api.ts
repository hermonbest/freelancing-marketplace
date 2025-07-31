// frontend/src/services/api.ts
import axios from "axios";

// Determine the base URL based on the environment
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://freelancing-marketplace.onrender.com/api" // Your Render backend URL
    : "http://localhost:8000/api"; // Your local development backend URL

// Create an Axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for sending cookies (sessionid, csrftoken)
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Add CSRF token header if available and needed
api.interceptors.request.use(
  (config) => {
    // Only attempt to add CSRF token for non-GET/HEAD requests
    // Axios with `withCredentials: true` handles session cookies automatically.
    if (
      config.method &&
      !["get", "head"].includes(config.method.toLowerCase())
    ) {
      // Safely get CSRF token from cookies
      const csrftoken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="))
        ?.split("=")[1];

      // Only add the header if the token exists and is not empty
      if (csrftoken) {
        config.headers["X-CSRFToken"] = csrftoken;
      }
      // If csrftoken is undefined/empty, we simply don't add the header.
      // This prevents sending an empty 'X-CSRFToken' header.
    }
    return config;
  },
  (error) => {
    // Handle request errors
    console.error("API Request Error (Interceptor):", error);
    return Promise.reject(error);
  }
);

// Response Interceptor (Keep your existing error handling)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Any status codes outside the range of 2xx cause this function to trigger
    if (error.response?.status === 403) {
      console.log("Authentication required for this action or CSRF failed.");
    }
    console.error("API Response Error:", error);
    return Promise.reject(error);
  }
);

// --- Define interfaces for data types (Optional but good practice) ---
// (Keep your existing interface definitions for RegisterData, LoginData, etc.)
// ...

// --- API Endpoint Definitions ---
// (Keep your existing authAPI and jobsAPI definitions)
export const authAPI = {
  register: (data: RegisterData) => api.post("/auth/register/", data),
  login: (LoginData) => api.post("/auth/login/", data),
  logout: () => api.post("/auth/logout/"), // This will now use the corrected backend view
  getCurrentUser: () => api.get("/auth/current/"),
  updateProfile: (data: any) => api.put("/auth/profile/", data),
};

export const jobsAPI = {
  getJobs: (params?: any) => api.get("/jobs/", { params }),
  getJob: (id: number) => api.get(`/jobs/${id}/`),
  createJob: (data: JobData) => api.post("/jobs/create/", data),
  getMyJobs: () => api.get("/jobs/my-jobs/"),
  getMyApplications: () => api.get("/jobs/my-applications/"),
  applyToJob: (jobId: number, data: ApplicationData) =>
    api.post(`/jobs/${jobId}/apply/`, data),
  getJobApplications: (jobId: number) =>
    api.get(`/jobs/${jobId}/applications/`),
  updateApplicationStatus: (applicationId: number, status: string) =>
    api.put(`/jobs/applications/${applicationId}/status/`, { status }),
};

export default api;
