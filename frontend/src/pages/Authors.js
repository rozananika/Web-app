import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
  Avatar,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MenuBook as BookIcon,
} from '@mui/icons-material';
import { authors } from '../services/api';

export default function Authors() {
  const [authorList, setAuthorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [showBooks, setShowBooks] = useState({});

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const response = await authors.getAll();
      setAuthorList(response.data);
    } catch (error) {
      console.error('Error fetching authors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await authors.search(searchQuery);
      setAuthorList(response.data);
    } catch (error) {
      console.error('Error searching authors:', error);
    }
  };

  const handleAddAuthor = () => {
    setSelectedAuthor(null);
    setOpenDialog(true);
  };

  const handleEditAuthor = (author) => {
    setSelectedAuthor(author);
    setOpenDialog(true);
  };

  const handleDeleteAuthor = async (authorId) => {
    if (window.confirm('Are you sure you want to delete this author?')) {
      try {
        await authors.delete(authorId);
        fetchAuthors();
      } catch (error) {
        console.error('Error deleting author:', error);
      }
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedAuthor(null);
  };

  const handleSaveAuthor = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const authorData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      biography: formData.get('biography'),
    };

    try {
      if (selectedAuthor) {
        await authors.update(selectedAuthor.id, authorData);
      } else {
        await authors.create(authorData);
      }
      handleDialogClose();
      fetchAuthors();
    } catch (error) {
      console.error('Error saving author:', error);
    }
  };

  const toggleShowBooks = (authorId) => {
    setShowBooks(prev => ({
      ...prev,
      [authorId]: !prev[authorId]
    }));
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Authors</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddAuthor}
        >
          Add Author
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="Search Authors"
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
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      <Grid container spacing={3}>
        {authorList.map((author) => (
          <Grid item key={author.id} xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, mr: 2 }}>
                    {author.firstName[0]}{author.lastName[0]}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">
                      {author.firstName} {author.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {author.books?.length || 0} books published
                    </Typography>
                  </Box>
                  <IconButton onClick={() => handleEditAuthor(author)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteAuthor(author.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
                
                <Typography variant="body1" paragraph>
                  {author.biography}
                </Typography>

                <Button
                  startIcon={<BookIcon />}
                  onClick={() => toggleShowBooks(author.id)}
                  size="small"
                >
                  {showBooks[author.id] ? 'Hide Books' : 'Show Books'}
                </Button>

                {showBooks[author.id] && author.books && (
                  <List dense>
                    {author.books.map((book) => (
                      <ListItem key={book.id}>
                        <ListItemText
                          primary={book.title}
                          secondary={`Published: ${book.publicationDate}`}
                        />
                        <Chip
                          label={book.genre}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveAuthor}>
          <DialogTitle>
            {selectedAuthor ? 'Edit Author' : 'Add New Author'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="firstName"
                  label="First Name"
                  defaultValue={selectedAuthor?.firstName}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="lastName"
                  label="Last Name"
                  defaultValue={selectedAuthor?.lastName}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="biography"
                  label="Biography"
                  defaultValue={selectedAuthor?.biography}
                  multiline
                  rows={4}
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
