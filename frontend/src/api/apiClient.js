import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Maps directly to our Spring Boot container port mapping
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token into all outgoing HTTP requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('whatsapp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;