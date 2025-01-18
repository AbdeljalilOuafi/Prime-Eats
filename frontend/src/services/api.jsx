import axios from "axios";

const api = axios.create({
  baseURL:  "https://api.primeeats.live/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Create a function to set the auth token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    // console.log("Token being set:", `Bearer ${token}`);
    // console.log("Current headers after setting:", api.defaults.headers.common);
  } else {
    delete api.defaults.headers.common["Authorization"];
    console.log("Token was cleared - no token provided");
  }
};


// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // Log the full request details
    console.log('Outgoing Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    return Promise.reject(error);
  }
);



export default api;
