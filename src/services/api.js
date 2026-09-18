import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  headers: { "X-Requested-With": "InternshipTracker" },
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.startsWith("/auth/")
    )
      window.dispatchEvent(new Event("session-expired"));
    return Promise.reject(error);
  },
);
export default api;
export const errorMessage = (error) =>
  error.response?.data?.error ||
  "Could not reach the server. Check that the backend is running.";
