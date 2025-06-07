import axios from "axios";

// const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;

const backend_url="http://localhost:4000/api"

const instance = axios.create({
  baseURL: backend_url,
  withCredentials: true, // ✅ Important for handling authentication
//   headers: {
//     "Content-Type": "application/json",
//   },
});

export default instance;



