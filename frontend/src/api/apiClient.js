import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Maps directly to our Spring Boot container port mapping
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;