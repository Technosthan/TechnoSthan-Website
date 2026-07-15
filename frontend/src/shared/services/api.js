// API service placeholder
// Purpose: Axios instance and API helpers
import axios from "axios";

const rawBaseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: rawBaseURL || "/",
});
