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

// Mock users data
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN'
  }
];

export const auth = {
  login: (username, password) => {
    const user = mockUsers.find(u => u.username === username && u.password === password);
    if (user) {
      const token = btoa(JSON.stringify({ userId: user.id, username: user.username, role: user.role }));
      localStorage.setItem('token', token);
      return Promise.resolve({ data: { token, user: { ...user, password: undefined } } });
    }
    return Promise.reject({ response: { data: { message: 'Invalid credentials' } } });
  },

  register: (userData) => {
    // Check if username already exists
    if (mockUsers.some(u => u.username === userData.username)) {
      return Promise.reject({ response: { data: { message: 'Username already exists' } } });
    }

    // Check if email already exists
    if (mockUsers.some(u => u.email === userData.email)) {
      return Promise.reject({ response: { data: { message: 'Email already exists' } } });
    }

    // Add new user
    const newUser = {
      id: mockUsers.length + 1,
      ...userData,
      role: 'USER'
    };
    mockUsers.push(newUser);

    return Promise.resolve({ data: { message: 'Registration successful' } });
  },

  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      return JSON.parse(atob(token));
    } catch {
      return null;
    }
  }
};

// Mock data for books and authors
const mockBooks = [
  {
    id: 1,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '9780743273565',
    genre: 'Fiction',
    publishedYear: 1925,
    description: 'The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
    coverImage: 'https://example.com/gatsby.jpg',
    totalCopies: 5,
    availableCopies: 3,
    rating: 4.5,
    reviews: 128
  },
  {
    id: 2,
    title: '1984',
    author: 'George Orwell',
    isbn: '9780451524935',
    genre: 'Science Fiction',
    publishedYear: 1949,
    description: 'A dystopian social science fiction novel that follows the life of Winston Smith.',
    coverImage: 'https://example.com/1984.jpg',
    totalCopies: 8,
    availableCopies: 2,
    rating: 4.7,
    reviews: 245
  },
  {
    id: 3,
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '9780446310789',
    genre: 'Fiction',
    publishedYear: 1960,
    description: 'The story of racial injustice and the loss of innocence in the American South.',
    coverImage: 'https://example.com/mockingbird.jpg',
    totalCopies: 6,
    availableCopies: 4,
    rating: 4.8,
    reviews: 198
  }
];

const mockAuthors = [
  {
    id: 1,
    name: 'F. Scott Fitzgerald',
    biography: 'American novelist and short story writer.',
    birthYear: 1896,
    deathYear: 1940,
    nationality: 'American',
    photo: 'https://example.com/fitzgerald.jpg',
    books: ['The Great Gatsby']
  },
  {
    id: 2,
    name: 'George Orwell',
    biography: 'English novelist, essayist, journalist, and critic.',
    birthYear: 1903,
    deathYear: 1950,
    nationality: 'British',
    photo: 'https://example.com/orwell.jpg',
    books: ['1984']
  },
  {
    id: 3,
    name: 'Harper Lee',
    biography: 'American novelist.',
    birthYear: 1926,
    deathYear: 2016,
    nationality: 'American',
    photo: 'https://example.com/lee.jpg',
    books: ['To Kill a Mockingbird']
  }
];

const mockLendings = [
  {
    id: 1,
    bookId: 1,
    userId: 1,
    borrowDate: '2025-01-01',
    dueDate: '2025-01-15',
    returnDate: null,
    status: 'ACTIVE'
  }
];

export const books = {
  getAll: () => Promise.resolve({ data: mockBooks }),
  getById: (id) => {
    const book = mockBooks.find(b => b.id === parseInt(id));
    return book
      ? Promise.resolve({ data: book })
      : Promise.reject({ response: { status: 404, data: { message: 'Book not found' } } });
  },
  create: (bookData) => {
    const newBook = {
      id: mockBooks.length + 1,
      ...bookData,
      rating: 0,
      reviews: 0,
      availableCopies: bookData.totalCopies
    };
    mockBooks.push(newBook);
    return Promise.resolve({ data: newBook });
  },
  update: (id, bookData) => {
    const index = mockBooks.findIndex(b => b.id === parseInt(id));
    if (index === -1) {
      return Promise.reject({ response: { status: 404, data: { message: 'Book not found' } } });
    }
    mockBooks[index] = { ...mockBooks[index], ...bookData };
    return Promise.resolve({ data: mockBooks[index] });
  },
  delete: (id) => {
    const index = mockBooks.findIndex(b => b.id === parseInt(id));
    if (index === -1) {
      return Promise.reject({ response: { status: 404, data: { message: 'Book not found' } } });
    }
    mockBooks.splice(index, 1);
    return Promise.resolve({ data: { message: 'Book deleted successfully' } });
  },
  search: (params) => {
    let filtered = [...mockBooks];
    if (params.title) {
      filtered = filtered.filter(b => 
        b.title.toLowerCase().includes(params.title.toLowerCase())
      );
    }
    if (params.genre) {
      filtered = filtered.filter(b => b.genre === params.genre);
    }
    return Promise.resolve({ data: filtered });
  },
  getAvailable: () => {
    const available = mockBooks.filter(b => b.availableCopies > 0);
    return Promise.resolve({ data: available });
  }
};

export const authors = {
  getAll: () => Promise.resolve({ data: mockAuthors }),
  getById: (id) => {
    const author = mockAuthors.find(a => a.id === parseInt(id));
    return author
      ? Promise.resolve({ data: author })
      : Promise.reject({ response: { status: 404, data: { message: 'Author not found' } } });
  },
  create: (authorData) => {
    const newAuthor = {
      id: mockAuthors.length + 1,
      ...authorData,
      books: []
    };
    mockAuthors.push(newAuthor);
    return Promise.resolve({ data: newAuthor });
  },
  update: (id, authorData) => {
    const index = mockAuthors.findIndex(a => a.id === parseInt(id));
    if (index === -1) {
      return Promise.reject({ response: { status: 404, data: { message: 'Author not found' } } });
    }
    mockAuthors[index] = { ...mockAuthors[index], ...authorData };
    return Promise.resolve({ data: mockAuthors[index] });
  },
  delete: (id) => {
    const index = mockAuthors.findIndex(a => a.id === parseInt(id));
    if (index === -1) {
      return Promise.reject({ response: { status: 404, data: { message: 'Author not found' } } });
    }
    mockAuthors.splice(index, 1);
    return Promise.resolve({ data: { message: 'Author deleted successfully' } });
  },
  search: (query) => {
    const filtered = mockAuthors.filter(a => 
      a.name.toLowerCase().includes(query.toLowerCase())
    );
    return Promise.resolve({ data: filtered });
  }
};

export const lendings = {
  getAll: () => Promise.resolve({ data: mockLendings }),
  getMyLendings: () => {
    const user = auth.getCurrentUser();
    if (!user) {
      return Promise.reject({ response: { status: 401, data: { message: 'Unauthorized' } } });
    }
    const userLendings = mockLendings.filter(l => l.userId === user.userId);
    return Promise.resolve({ data: userLendings });
  },
  borrowBook: (bookId) => {
    const user = auth.getCurrentUser();
    if (!user) {
      return Promise.reject({ response: { status: 401, data: { message: 'Unauthorized' } } });
    }
    
    const book = mockBooks.find(b => b.id === parseInt(bookId));
    if (!book) {
      return Promise.reject({ response: { status: 404, data: { message: 'Book not found' } } });
    }
    
    if (book.availableCopies <= 0) {
      return Promise.reject({ response: { status: 400, data: { message: 'Book not available' } } });
    }
    
    const lending = {
      id: mockLendings.length + 1,
      bookId: parseInt(bookId),
      userId: user.userId,
      borrowDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      returnDate: null,
      status: 'ACTIVE'
    };
    
    mockLendings.push(lending);
    book.availableCopies--;
    
    return Promise.resolve({ data: lending });
  },
  returnBook: (lendingId) => {
    const index = mockLendings.findIndex(l => l.id === parseInt(lendingId));
    if (index === -1) {
      return Promise.reject({ response: { status: 404, data: { message: 'Lending not found' } } });
    }
    
    const lending = mockLendings[index];
    if (lending.status !== 'ACTIVE') {
      return Promise.reject({ response: { status: 400, data: { message: 'Book already returned' } } });
    }
    
    const book = mockBooks.find(b => b.id === lending.bookId);
    if (book) {
      book.availableCopies++;
    }
    
    lending.returnDate = new Date().toISOString().split('T')[0];
    lending.status = 'RETURNED';
    
    return Promise.resolve({ data: lending });
  },
  getOverdue: () => {
    const today = new Date().toISOString().split('T')[0];
    const overdue = mockLendings.filter(l => 
      l.status === 'ACTIVE' && l.dueDate < today
    );
    return Promise.resolve({ data: overdue });
  }
};

// Mock data for testing
const mockData = {
  correlationData: Array.from({ length: 100 }, (_, i) => ({
    id: i,
    x: Math.random() * 10,
    y: Math.random() * 10 + Math.sin(i / 10) * 2,
    value: Math.random() * 100 + Math.sin(i / 10) * 20,
  })),
  stats: {
    totalBooks: 1250,
    activeUsers: 450,
    averageRating: 4.2,
    totalLendings: 890,
    activeLendings: 120,
    overdueBooks: 15,
    metrics: {
      checkouts: 890,
      returns: 770,
      renewals: 230,
      newUsers: 45,
      activeUsers: 450,
      retention: 0.85,
    },
    booksByGenre: {
      'Fiction': 450,
      'Non-Fiction': 380,
      'Science': 220,
      'History': 150,
      'Technology': 50,
    },
    lendingsByMonth: {
      'Jan': 95,
      'Feb': 82,
      'Mar': 99,
      'Apr': 86,
      'May': 94,
      'Jun': 102,
      'Jul': 88,
    },
    mostBorrowedBooks: [
      { id: 1, title: 'The Great Gatsby', count: 42 },
      { id: 2, title: '1984', count: 38 },
      { id: 3, title: 'To Kill a Mockingbird', count: 35 },
      { id: 4, title: 'Pride and Prejudice', count: 33 },
      { id: 5, title: 'The Catcher in the Rye', count: 30 },
    ],
    mostActiveMembers: [
      { id: 1, name: 'John Smith', count: 15 },
      { id: 2, name: 'Emma Wilson', count: 12 },
      { id: 3, name: 'Michael Brown', count: 10 },
      { id: 4, name: 'Sarah Davis', count: 9 },
      { id: 5, name: 'David Miller', count: 8 },
    ],
    highestRatedBooks: [
      { id: 1, title: 'To Kill a Mockingbird', rating: 4.8 },
      { id: 2, title: 'Pride and Prejudice', rating: 4.7 },
      { id: 3, title: '1984', rating: 4.6 },
      { id: 4, title: 'The Great Gatsby', rating: 4.5 },
      { id: 5, title: 'The Catcher in the Rye', rating: 4.4 },
    ],
    timeline: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 100 + Math.sin(i / 5) * 20),
    })),
    comparisonTimeline: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2023, 11, i + 1).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 80 + Math.sin(i / 5) * 15),
    })),
    categories: ['Fiction', 'Non-Fiction', 'Science', 'History', 'Technology'],
  },
  userBehavior: {
    userSegments: [
      {
        id: 1,
        username: 'John Smith',
        segment: 'POWER_USER',
        engagementScore: 0.95,
        lastActive: '2024-01-18',
        preferredGenres: ['Fiction', 'Mystery', 'Sci-Fi'],
      },
      {
        id: 2,
        username: 'Emma Wilson',
        segment: 'ACTIVE_USER',
        engagementScore: 0.85,
        lastActive: '2024-01-17',
        preferredGenres: ['Romance', 'Drama'],
      },
      {
        id: 3,
        username: 'Michael Brown',
        segment: 'CASUAL_USER',
        engagementScore: 0.65,
        lastActive: '2024-01-15',
        preferredGenres: ['Non-Fiction'],
      },
    ],
    activityPatterns: Array.from({ length: 7 }, () =>
      Array.from({ length: 24 }, () => Math.floor(Math.random() * 100))
    ),
    avgEngagementScore: 0.85,
    avgRetentionScore: 0.78,
    avgActivityScore: 0.92,
    avgSatisfactionScore: 0.88,
    avgDiversityScore: 0.72,
  },
  inventoryAnalytics: {
    inventoryHealth: [
      {
        bookId: 1,
        title: 'The Great Gatsby',
        status: 'OPTIMAL',
        availableCopies: 5,
        totalCopies: 8,
        utilization: 0.75,
        condition: 'GOOD',
        maintenanceStatus: 'UP_TO_DATE'
      },
      {
        bookId: 2,
        title: '1984',
        status: 'UNDER_STOCKED',
        availableCopies: 1,
        totalCopies: 10,
        utilization: 0.9,
        condition: 'FAIR',
        maintenanceStatus: 'NEEDS_ATTENTION'
      },
      {
        bookId: 3,
        title: 'To Kill a Mockingbird',
        status: 'OVER_STOCKED',
        availableCopies: 12,
        totalCopies: 15,
        utilization: 0.2,
        condition: 'EXCELLENT',
        maintenanceStatus: 'UP_TO_DATE'
      }
    ],
    demandPredictions: [
      {
        bookId: 1,
        title: 'The Great Gatsby',
        predictedDemand: 25,
        confidence: 0.85,
        trend: 'INCREASING'
      },
      {
        bookId: 2,
        title: '1984',
        predictedDemand: 30,
        confidence: 0.9,
        trend: 'STABLE'
      }
    ],
    acquisitionRecommendations: [
      {
        bookId: 2,
        title: '1984',
        recommendedCopies: 5,
        priority: 'HIGH',
        reason: 'High demand, low availability'
      },
      {
        bookId: 4,
        title: 'Pride and Prejudice',
        recommendedCopies: 3,
        priority: 'MEDIUM',
        reason: 'Moderate demand increase'
      }
    ],
    maintenanceNeeds: [
      {
        bookId: 2,
        title: '1984',
        condition: 'FAIR',
        maintenanceType: 'REPAIR',
        priority: 'HIGH',
        notes: 'Several pages need repair'
      },
      {
        bookId: 5,
        title: 'The Catcher in the Rye',
        condition: 'POOR',
        maintenanceType: 'REPLACE',
        priority: 'HIGH',
        notes: 'Book is severely damaged'
      }
    ]
  },
};

export const analytics = {
  getStats: (startDate, endDate, filters = {}) =>
    Promise.resolve({ data: mockData.stats }),
  
  getPredictions: (filters = {}) =>
    Promise.resolve({
      data: {
        demandForecast: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
          value: Math.floor(Math.random() * 50 + 50 + Math.sin(i / 5) * 20),
        })),
        popularityTrends: [
          { title: 'The Great Gatsby', trend: 'RISING', description: 'Gaining popularity' },
          { title: '1984', trend: 'RISING', description: 'Steady increase' },
          { title: 'To Kill a Mockingbird', trend: 'FLAT', description: 'Stable interest' },
          { title: 'Pride and Prejudice', trend: 'FALLING', description: 'Slight decline' },
          { title: 'The Catcher in the Rye', trend: 'RISING', description: 'Growing interest' },
        ],
        returnPredictions: [
          { title: 'The Great Gatsby', date: '2024-01-25', probability: 0.95 },
          { title: '1984', date: '2024-01-26', probability: 0.85 },
          { title: 'To Kill a Mockingbird', date: '2024-01-27', probability: 0.75 },
          { title: 'Pride and Prejudice', date: '2024-01-28', probability: 0.65 },
          { title: 'The Catcher in the Rye', date: '2024-01-29', probability: 0.55 },
        ],
        genreTrends: [
          { genre: 'Fiction', trend: 'RISING', description: 'Popular among young readers' },
          { genre: 'Non-Fiction', trend: 'FLAT', description: 'Steady interest' },
          { genre: 'Science Fiction', trend: 'RISING', description: 'Growing popularity' },
          { genre: 'Mystery', trend: 'FALLING', description: 'Slight decline in interest' },
          { genre: 'Romance', trend: 'RISING', description: 'Seasonal increase' },
          { genre: 'Biography', trend: 'FLAT', description: 'Consistent demand' },
        ],
      }
    }),

  getUserBehavior: (filters = {}) =>
    Promise.resolve({ data: mockData.userBehavior }),
  
  getInventoryAnalytics: (filters = {}) =>
    Promise.resolve({ data: mockData.inventoryAnalytics }),
  
  getCorrelationData: (filters = {}) =>
    Promise.resolve({ data: mockData.correlationData.slice(0, 20) }),
  
  getTrendData: (filters = {}) =>
    Promise.resolve({
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
        checkouts: Math.floor(Math.random() * 100 + Math.sin(i / 5) * 20),
        activeUsers: Math.floor(Math.random() * 80 + Math.sin(i / 5) * 15),
      })),
    }),
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
