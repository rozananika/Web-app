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
  Slider,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material';
import { books } from '../services/api';
import { DateRangePicker } from '../components/DateRangePicker';
import { ImageUpload } from '../components/ImageUpload';

export default function Books() {
  const navigate = useNavigate();
  const [bookList, setBookList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [publishDateRange, setPublishDateRange] = useState([1900, 2025]);
  const [availability, setAvailability] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Dialog States
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [openFilters, setOpenFilters] = useState(false);

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

  const sortOptions = [
    { value: 'title', label: 'Title' },
    { value: 'author', label: 'Author' },
    { value: 'publishedYear', label: 'Publication Year' },
    { value: 'rating', label: 'Rating' },
    { value: 'availableCopies', label: 'Availability' },
  ];

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await books.getAll();
      setBookList(response.data);
    } catch (error) {
      setError('Failed to fetch books. Please try again later.');
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await books.search({
        title: searchQuery,
        genre: genre,
        publishYearStart: publishDateRange[0],
        publishYearEnd: publishDateRange[1],
        availability: availability,
        minRating: minRating,
        sortBy: sortBy,
        sortOrder: sortOrder,
      });
      setBookList(response.data);
    } catch (error) {
      setError('Search failed. Please try again.');
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await books.export({
        format,
        filters: {
          title: searchQuery,
          genre: genre,
          publishYearStart: publishDateRange[0],
          publishYearEnd: publishDateRange[1],
          availability: availability,
          minRating: minRating,
        },
      });
      
      // Create and download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `books_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError('Export failed. Please try again.');
      console.error('Error exporting books:', error);
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
        setError('Failed to delete book. Please try again.');
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
      setError('Failed to save book. Please try again.');
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
        <Button
          variant="contained"
          startIcon={<FilterIcon />}
          onClick={() => setOpenFilters(true)}
        >
          Filters
        </Button>
        <Button
          variant="contained"
          startIcon={<ExportIcon />}
          onClick={() => handleExport('csv')}
        >
          Export CSV
        </Button>
        <Button
          variant="contained"
          startIcon={<ExportIcon />}
          onClick={() => handleExport('json')}
        >
          Export JSON
        </Button>
      </Box>

      <Dialog open={openFilters} onClose={() => setOpenFilters(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Filters</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="availability-label">Availability</InputLabel>
                <Select
                  labelId="availability-label"
                  label="Availability"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="unavailable">Unavailable</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="sort-by-label">Sort By</InputLabel>
                <Select
                  labelId="sort-by-label"
                  label="Sort By"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="sort-order-label">Sort Order</InputLabel>
                <Select
                  labelId="sort-order-label"
                  label="Sort Order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <DateRangePicker
                label="Publish Date Range"
                value={publishDateRange}
                onChange={(range) => setPublishDateRange(range)}
              />
            </Grid>
            <Grid item xs={12}>
              <Slider
                value={minRating}
                onChange={(e, value) => setMinRating(value)}
                min={0}
                max={5}
                step={0.5}
                marks={[
                  { value: 0, label: '0' },
                  { value: 1, label: '1' },
                  { value: 2, label: '2' },
                  { value: 3, label: '3' },
                  { value: 4, label: '4' },
                  { value: 5, label: '5' },
                ]}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFilters(false)}>Cancel</Button>
          <Button onClick={handleSearch}>Apply Filters</Button>
        </DialogActions>
      </Dialog>

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
                <ImageUpload
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

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
