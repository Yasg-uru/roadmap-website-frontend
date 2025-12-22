import axios from "axios";
const 
axiosInstance = axios.create({
  baseURL: "https://roadmap-backend-1-9rcd.onrender.com",
  // baseURL: "http://localhost:8000",
  withCredentials: true,
});
export default axiosInstance;
