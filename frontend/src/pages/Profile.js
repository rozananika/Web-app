import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  MenuBook as BookIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { lendings, reviews } from '../services/api';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState(0);
  const [myLendings, setMyLendings] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    fetchMyLendings();
    fetchMyReviews();
  }, []);

  const fetchMyLendings = async () => {
    try {
      const response = await lendings.getMyLendings();
      setMyLendings(response.data);
    } catch (error) {
      console.error('Error fetching lendings:', error);
    }
  };

  const fetchMyReviews = async () => {
    try {
      const response = await reviews.getMyReviews();
      setMyReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    if (formData.get('newPassword') !== formData.get('confirmPassword')) {
      alert('Passwords do not match');
      return;
    }

    try {
      // Implement password change API call
      setOpenPasswordDialog(false);
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const userData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
    };

    try {
      // Implement profile update API call
      setUser({ ...user, ...userData });
      localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
      setOpenProfileDialog(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar sx={{ width: 100, height: 100, mb: 2 }}>
                  <PersonIcon sx={{ fontSize: 60 }} />
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user.email}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setOpenProfileDialog(true)}
                    sx={{ mr: 1 }}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setOpenPasswordDialog(true)}
                    startIcon={<SecurityIcon />}
                  >
                    Change Password
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab icon={<BookIcon />} label="My Lendings" />
                <Tab icon={<StarIcon />} label="My Reviews" />
              </Tabs>

              <TabPanel value={activeTab} index={0}>
                <List>
                  {myLendings.map((lending) => (
                    <ListItem key={lending.id}>
                      <ListItemText
                        primary={lending.book.title}
                        secondary={`Borrowed: ${new Date(lending.borrowDate).toLocaleDateString()}`}
                      />
                      <Chip
                        label={lending.returnDate ? 'Returned' : `Due: ${new Date(lending.dueDate).toLocaleDateString()}`}
                        color={lending.returnDate ? 'success' : 'warning'}
                      />
                    </ListItem>
                  ))}
                </List>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <List>
                  {myReviews.map((review) => (
                    <ListItem key={review.id}>
                      <ListItemText
                        primary={review.book.title}
                        secondary={review.comment}
                      />
                      <Rating value={review.rating} readOnly />
                    </ListItem>
                  ))}
                </List>
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <form onSubmit={handlePasswordChange}>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  name="currentPassword"
                  label="Current Password"
                  type="password"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="newPassword"
                  label="New Password"
                  type="password"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Change Password
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Profile Edit Dialog */}
      <Dialog open={openProfileDialog} onClose={() => setOpenProfileDialog(false)}>
        <form onSubmit={handleProfileUpdate}>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="firstName"
                  label="First Name"
                  defaultValue={user.firstName}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="lastName"
                  label="Last Name"
                  defaultValue={user.lastName}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  defaultValue={user.email}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenProfileDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
