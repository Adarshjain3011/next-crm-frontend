import axios from "axios";


const backend_url = `${process.env.NEXT_PUBLIC_BASE_URL}/api`;


const instance = axios.create({
  baseURL: backend_url,
  withCredentials: true, // ✅ Important for handling authentication

});

export default instance;



