import axios from "axios";
const 
axiosInstance = axios.create({
//   baseURL: "https://advance-online-learning-platform.vercel.app",
  baseURL: "http://localhost:8000",
  withCredentials: true,
});
export default axiosInstance;
