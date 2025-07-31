import axios from "axios";

// Use different base URLs for development and production
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://freelancing-marketplace.onrender.com'  // Replace with your actual Render URL
  : 'http://localhost:8000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include CSRF token
api.interceptors.request.use(
  (config) => {
    // Get CSRF token from cookies
    const csrftoken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];

    if (csrftoken) {
      config.headers["X-CSRFToken"] = csrftoken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.log("Authentication required for this action");
    }
    return Promise.reject(error);
  }
);

// Define interfaces for our data types
interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface JobData {
  title: string;
  description: string;
  category: string;
  experience_level: string;
  is_fixed_price: boolean;
  budget: number | null;
  deadline: string | null;
}

interface ApplicationData {
  cover_letter: string;
  bid_amount: number | null;
}

// Auth endpoints
export const authAPI = {
  register: (data: RegisterData) => api.post("/auth/register/", data),
  login: (data: LoginData) => api.post("/auth/login/", data),
  logout: () => api.post("/auth/logout/"),
  getCurrentUser: () => api.get("/auth/current/"),
  updateProfile: (data: any) => api.put("/auth/profile/", data),
};

// Jobs endpoints
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
