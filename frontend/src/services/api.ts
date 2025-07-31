// frontend/src/services/api.ts
import axios from "axios";

// Determine the base URL based on the environment
// In production (on Vercel), it should point to your Render backend
// In development (localhost), it points to your local Django server
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
    // Note: We are NOT manually setting 'X-CSRFToken' here.
    // Axios with `withCredentials: true` should handle session cookies automatically.
    // Django REST Framework, with `@wraps(csrf_exempt)` on the backend logout view,
    // should not require the CSRF header for that specific endpoint.
  },
});

// Request Interceptor (Optional, but useful for debugging or adding global headers if needed)
api.interceptors.request.use(
  (config) => {
    // You can log requests for debugging
    // console.log('API Request:', config);
    return config;
  },
  (error) => {
    // Handle request errors
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor (Keep your existing error handling)
api.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // You can log responses for debugging if needed
    // console.log('API Response:', response);
    return response;
  },
  (error) => {
    // Any status codes outside the range of 2xx cause this function to trigger
    if (error.response?.status === 403) {
      // This message is helpful, keep it or modify as needed
      console.log("Authentication required for this action or CSRF failed.");
      // Depending on your app's needs, you might want to trigger a logout or redirect here
      // For example, if the 403 is due to an expired session:
      // if (error.response.data?.detail === "Authentication credentials were not provided.") {
      //    // Trigger context logout or redirect to login
      // }
    }
    // Log the full error for debugging
    console.error("API Response Error:", error);
    return Promise.reject(error);
  }
);

// --- Define interfaces for data types (Optional but good practice for TypeScript) ---

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type: string; // 'freelancer' or 'client'
}

interface LoginData {
  username: string;
  password: string;
}

interface JobData {
  title: string;
  description: string;
  category: string;
  experience_level: string; // 'entry', 'intermediate', 'expert'
  is_fixed_price: boolean;
  budget: number | null;
  deadline: string | null; // ISO 8601 date string or null
}

interface ApplicationData {
  cover_letter: string;
  bid_amount: number | null;
}

// --- API Endpoint Definitions ---

// Auth endpoints
export const authAPI = {
  register: (data: RegisterData) => api.post("/auth/register/", data),
  login: (data: LoginData) => api.post("/auth/login/", data),
  logout: () => api.post("/auth/logout/"), // POST request, uses credentials
  getCurrentUser: () => api.get("/auth/current/"), // GET request, uses credentials
  updateProfile: (data: any) => api.put("/auth/profile/", data), // PUT request, uses credentials
};

// Jobs endpoints
export const jobsAPI = {
  getJobs: (params?: any) => api.get("/jobs/", { params }), // GET, public endpoint
  getJob: (id: number) => api.get(`/jobs/${id}/`), // GET, public endpoint
  createJob: (data: JobData) => api.post("/jobs/create/", data), // POST, requires auth
  getMyJobs: () => api.get("/jobs/my-jobs/"), // GET, requires auth (client)
  getMyApplications: () => api.get("/jobs/my-applications/"), // GET, requires auth (freelancer)
  applyToJob: (jobId: number, data: ApplicationData) =>
    api.post(`/jobs/${jobId}/apply/`, data), // POST, requires auth (freelancer)
  getJobApplications: (jobId: number) =>
    api.get(`/jobs/${jobId}/applications/`), // GET, requires auth (job owner/client)
  updateApplicationStatus: (applicationId: number, status: string) =>
    api.put(`/jobs/applications/${applicationId}/status/`, { status }), // PUT, requires auth (job owner/client)
};

// Export the configured Axios instance as default if needed elsewhere
export default api;
