import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Authors from './pages/Authors';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import BookDetails from './pages/BookDetails';
import Profile from './pages/Profile';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="books" element={<PrivateRoute><Books /></PrivateRoute>} />
            <Route path="books/:id" element={<PrivateRoute><BookDetails /></PrivateRoute>} />
            <Route path="authors" element={<PrivateRoute><Authors /></PrivateRoute>} />
            <Route path="analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
            <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
