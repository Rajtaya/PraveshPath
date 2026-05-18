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
export const getCourses = (params) => api.get('/courses/', { params });
export const getUniversityCourses = (params) => api.get('/university-courses/', { params });
export const getUniversityCourseDetail = (id) => api.get(`/university-courses/${id}/`);

export const getBrowseUniversities = (level) => api.get('/browse/universities/', { params: { level } });
export const getUniversityProgrammes = (uniId, level) => api.get(`/browse/universities/${uniId}/programmes/`, { params: { level } });

export default api;
