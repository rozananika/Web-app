import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const auth = {
  login: (username, password) => api.post('/auth/signin', { username, password }),
  register: (userData) => api.post('/auth/signup', userData),
};

export const books = {
  getAll: () => api.get('/books'),
  getById: (id) => api.get(`/books/${id}`),
  create: (bookData) => api.post('/books', bookData),
  update: (id, bookData) => api.put(`/books/${id}`, bookData),
  delete: (id) => api.delete(`/books/${id}`),
  search: (params) => api.get('/books/search', { params }),
  getAvailable: () => api.get('/books/available'),
};

export const authors = {
  getAll: () => api.get('/authors'),
  getById: (id) => api.get(`/authors/${id}`),
  create: (authorData) => api.post('/authors', authorData),
  update: (id, authorData) => api.put(`/authors/${id}`, authorData),
  delete: (id) => api.delete(`/authors/${id}`),
  search: (query) => api.get('/authors/search', { params: { query } }),
};

export const reviews = {
  getBookReviews: (bookId) => api.get(`/reviews/book/${bookId}`),
  getMyReviews: () => api.get('/reviews/my-reviews'),
  create: (bookId, reviewData) => api.post(`/reviews/book/${bookId}`, reviewData),
  approve: (reviewId) => api.put(`/reviews/${reviewId}/approve`),
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
  getPending: () => api.get('/reviews/pending'),
  getBookRating: (bookId) => api.get(`/reviews/book/${bookId}/rating`),
};

export const lendings = {
  getAll: () => api.get('/lendings'),
  getMyLendings: () => api.get('/lendings/my-lendings'),
  borrowBook: (bookId) => api.post(`/lendings/borrow/${bookId}`),
  returnBook: (lendingId) => api.post(`/lendings/return/${lendingId}`),
  getOverdue: () => api.get('/lendings/overdue'),
};

export const analytics = {
  getStats: (startDate, endDate, filters = {}) => api.get('/analytics/stats', {
    params: { startDate, endDate, ...filters }
  }),
  getPredictions: (filters = {}) => api.get('/analytics/predictions', {
    params: { ...filters }
  }),
  getUserBehavior: (filters = {}) => api.get('/analytics/user-behavior', {
    params: { ...filters }
  }),
  getInventoryAnalytics: (filters = {}) => api.get('/analytics/inventory', {
    params: { ...filters }
  }),
  getActivityPatterns: (filters = {}) => api.get('/analytics/activity-patterns', {
    params: { ...filters }
  }),
  getBookPerformance: (filters = {}) => api.get('/analytics/book-performance', {
    params: { ...filters }
  }),
  exportLendingHistory: (startDate, endDate, format = 'excel') => api.get('/export/lending-history', {
    params: { startDate, endDate, format },
    responseType: 'blob'
  }),
  exportAnalytics: (type, startDate, endDate, format = 'excel') => api.get(`/export/${type}`, {
    params: { startDate, endDate, format },
    responseType: 'blob'
  }),
  exportVisualization: (chartId, format = 'png') => api.get('/export/visualization', {
    params: { chartId, format },
    responseType: 'blob'
  }),
  saveFilterPreset: (preset) => api.post('/analytics/presets', preset),
  getFilterPresets: () => api.get('/analytics/presets'),
  deleteFilterPreset: (presetId) => api.delete(`/analytics/presets/${presetId}`),
};

export const recommendations = {
  getPersonalized: () => api.get('/recommendations/personalized'),
  getSimilarBooks: (bookId) => api.get(`/recommendations/similar/${bookId}`),
};

export const fileUpload = {
  uploadImage: (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
