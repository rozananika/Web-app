import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Rating,
  TextField,
  Typography,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { books } from '../services/api';
import DateRangePicker from '../components/DateRangePicker';
import ImageUpload from '../components/ImageUpload';

export default function Books() {
  const navigate = useNavigate();
  const [bookList, setBookList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const genres = [
    'Fiction',
    'Non-Fiction',
    'Science Fiction',
    'Mystery',
    'Romance',
    'Biography',
    'History',
    'Science',
    'Technology',
    'Other',
  ];

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await books.getAll();
      setBookList(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await books.search({
        title: searchQuery,
        genre: genre,
      });
      setBookList(response.data);
    } catch (error) {
      console.error('Error searching books:', error);
    }
  };

  const handleAddBook = () => {
    setSelectedBook(null);
    setOpenDialog(true);
  };

  const handleEditBook = (book) => {
    setSelectedBook(book);
    setOpenDialog(true);
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await books.delete(bookId);
        fetchBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedBook(null);
  };

  const handleSaveBook = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const bookData = {
      title: formData.get('title'),
      isbn: formData.get('isbn'),
      summary: formData.get('summary'),
      genre: formData.get('genre'),
      totalCopies: parseInt(formData.get('totalCopies')),
      availableCopies: parseInt(formData.get('availableCopies')),
      coverImageUrl: formData.get('coverImageUrl'),
    };

    try {
      if (selectedBook) {
        await books.update(selectedBook.id, bookData);
      } else {
        await books.create(bookData);
      }
      handleDialogClose();
      fetchBooks();
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Books</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddBook}
        >
          Add Book
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="Search Books"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1 }}
        />
        <TextField
          select
          label="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          sx={{ width: 200 }}
        >
          <MenuItem value="">All Genres</MenuItem>
          {genres.map((g) => (
            <MenuItem key={g} value={g}>{g}</MenuItem>
          ))}
        </TextField>
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      <Grid container spacing={3}>
        {bookList.map((book) => (
          <Grid item key={book.id} xs={12} sm={6} md={4} lg={3}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={book.coverImageUrl || 'https://via.placeholder.com/200x300'}
                alt={book.title}
              />
              <CardContent>
                <Typography variant="h6" noWrap>
                  {book.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  ISBN: {book.isbn}
                </Typography>
                <Rating value={book.averageRating || 0} readOnly precision={0.5} />
                <Typography variant="body2">
                  Available: {book.availableCopies}/{book.totalCopies}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate(`/books/${book.id}`)}>
                  View Details
                </Button>
                <IconButton onClick={() => handleEditBook(book)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteBook(book.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveBook}>
          <DialogTitle>
            {selectedBook ? 'Edit Book' : 'Add New Book'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Title"
                  defaultValue={selectedBook?.title}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="isbn"
                  label="ISBN"
                  defaultValue={selectedBook?.isbn}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="summary"
                  label="Summary"
                  defaultValue={selectedBook?.summary}
                  multiline
                  rows={4}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  name="genre"
                  label="Genre"
                  defaultValue={selectedBook?.genre || ''}
                  fullWidth
                  required
                >
                  {genres.map((g) => (
                    <MenuItem key={g} value={g}>{g}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="totalCopies"
                  label="Total Copies"
                  type="number"
                  defaultValue={selectedBook?.totalCopies}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="availableCopies"
                  label="Available Copies"
                  type="number"
                  defaultValue={selectedBook?.availableCopies}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="coverImageUrl"
                  label="Cover Image URL"
                  defaultValue={selectedBook?.coverImageUrl}
                  fullWidth
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
