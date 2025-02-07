import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Rating,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  Person as PersonIcon,
  Book as BookIcon,
} from '@mui/icons-material';
import { books, reviews, lendings } from '../services/api';

export default function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [bookReviews, setBookReviews] = useState([]);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookDetails();
    fetchBookReviews();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      const response = await books.getById(id);
      setBook(response.data);
    } catch (error) {
      console.error('Error fetching book details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookReviews = async () => {
    try {
      const response = await reviews.getBookReviews(id);
      setBookReviews(response.data);
    } catch (error) {
      console.error('Error fetching book reviews:', error);
    }
  };

  const handleBorrowBook = async () => {
    try {
      await lendings.borrowBook(id);
      fetchBookDetails(); // Refresh book details to update availability
    } catch (error) {
      console.error('Error borrowing book:', error);
    }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const reviewData = {
      rating: parseInt(formData.get('rating')),
      comment: formData.get('comment'),
    };

    try {
      await reviews.create(id, reviewData);
      setOpenReviewDialog(false);
      fetchBookReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!book) {
    return <div>Book not found</div>;
  }

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={book.coverImageUrl || 'https://via.placeholder.com/400x600'}
              alt={book.title}
            />
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Rating value={book.averageRating || 0} readOnly precision={0.5} />
              </Box>
              <Button
                variant="contained"
                fullWidth
                disabled={book.availableCopies === 0}
                onClick={handleBorrowBook}
              >
                {book.availableCopies > 0 ? 'Borrow Book' : 'Not Available'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              {book.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              ISBN: {book.isbn}
            </Typography>
            <Box sx={{ my: 2 }}>
              <Chip icon={<BookIcon />} label={book.genre} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Available Copies: {book.availableCopies}/{book.totalCopies}
              </Typography>
            </Box>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Summary
            </Typography>
            <Typography variant="body1" paragraph>
              {book.summary}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Authors
              </Typography>
              {book.authors?.map((author) => (
                <Chip
                  key={author.id}
                  icon={<PersonIcon />}
                  label={`${author.firstName} ${author.lastName}`}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Reviews</Typography>
                <Button variant="outlined" onClick={() => setOpenReviewDialog(true)}>
                  Write Review
                </Button>
              </Box>
              <List>
                {bookReviews.map((review) => (
                  <ListItem key={review.id} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography component="span" variant="subtitle1" sx={{ mr: 1 }}>
                            {review.username}
                          </Typography>
                          <Rating value={review.rating} readOnly size="small" />
                        </Box>
                      }
                      secondary={review.comment}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Similar Books */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Similar Books You Might Like
          </Typography>
          <BookRecommendations bookId={id} />
        </Paper>
      </Grid>

      <Dialog open={openReviewDialog} onClose={() => setOpenReviewDialog(false)}>
        <form onSubmit={handleSubmitReview}>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2, mt: 1 }}>
              <Typography component="legend">Rating</Typography>
              <Rating
                name="rating"
                defaultValue={5}
                precision={1}
              />
            </Box>
            <TextField
              name="comment"
              label="Your Review"
              multiline
              rows={4}
              fullWidth
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenReviewDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Submit Review
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
