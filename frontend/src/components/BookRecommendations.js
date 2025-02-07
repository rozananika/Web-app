import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Rating,
  Chip,
  Skeleton,
} from '@mui/material';
import { recommendations } from '../services/api';

export default function BookRecommendations({ bookId }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
  }, [bookId]);

  const fetchRecommendations = async () => {
    try {
      const response = bookId
        ? await recommendations.getSimilarBooks(bookId)
        : await recommendations.getPersonalized();
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((key) => (
          <Grid item key={key} xs={12} sm={6} md={3}>
            <Card>
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton variant="text" />
                <Skeleton variant="text" width="60%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {books.map((book) => (
        <Grid item key={book.id} xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
                transition: 'all 0.2s ease-in-out',
              },
            }}
            onClick={() => navigate(`/books/${book.id}`)}
          >
            <CardMedia
              component="img"
              height="200"
              image={book.coverImageUrl || 'https://via.placeholder.com/200x300'}
              alt={book.title}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" noWrap>
                {book.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={book.averageRating || 0} readOnly size="small" />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({book.averageRating?.toFixed(1) || 'No ratings'})
                </Typography>
              </Box>
              <Chip
                label={book.genre}
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
              {book.availableCopies > 0 ? (
                <Chip
                  label="Available"
                  color="success"
                  size="small"
                />
              ) : (
                <Chip
                  label="Not Available"
                  color="error"
                  size="small"
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
