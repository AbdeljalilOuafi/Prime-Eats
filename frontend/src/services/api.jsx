import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Create a function to set the auth token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("Token being set:", `Bearer ${token.substring(0, 10)}...`); // Log first 10 chars for safety
    console.log("Current headers after setting:", api.defaults.headers.common);
  } else {
    delete api.defaults.headers.common["Authorization"];
    console.log("Token was cleared - no token provided");
  }
};
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  (config) => {
    console.log('Request Headers:', config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;