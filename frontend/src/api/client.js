import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
}

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        isRefreshing = false;
        return Promise.reject(error);
      }
      try {
        const res = await axios.post('${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/students/auth/token/refresh/', { refresh });
        localStorage.setItem('access_token', res.data.access);
        processQueue(null, res.data.access);
        original.headers.Authorization = `Bearer ${res.data.access}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export const createProfile = (data) => api.post('/students/profile/', data);
export const getMyProfile = () => api.get('/students/profile/me/');
export const getMatchResults = () => api.get('/match/results/');
export const quickMatch = (data) => api.post('/match/quick/', data);

export const getUniversities = (params) => api.get('/universities/', { params });
export const getCourses = (params) => api.get('/courses/', { params });
export const getUniversityCourses = (params) => api.get('/university-courses/', { params });
export const getUniversityCourseDetail = (id) => api.get(`/university-courses/${id}/`);

export const getBrowseUniversities = (level) => api.get('/browse/universities/', { params: { level } });
export const getUniversityProgrammes = (uniId, level) => api.get(`/browse/universities/${uniId}/programmes/`, { params: { level } });

export const googleLogin = (credential) => api.post('/students/auth/google/', { credential });

export default api;
