import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

export const createProfile = (data) => api.post('/students/profile/', data);
export const getProfile = (sessionId) => api.get(`/students/profile/${sessionId}/`);
export const getMatchResults = (sessionId) => api.get(`/match/results/${sessionId}/`);
export const quickMatch = (data) => api.post('/match/quick/', data);

export const getUniversities = (params) => api.get('/universities/', { params });
export const getColleges = (params) => api.get('/colleges/', { params });
export const getCourses = (params) => api.get('/courses/', { params });
export const getCollegeCourses = (params) => api.get('/college-courses/', { params });
export const getCollegeCourseDetail = (id) => api.get(`/college-courses/${id}/`);

export default api;
