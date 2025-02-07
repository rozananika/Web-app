import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/auth/signup', formData);
            if (response.data) {
                navigate('/login');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during registration');
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} style={{ padding: 20, marginTop: 50 }}>
                <Typography component="h1" variant="h5" align="center">
                    Sign Up
                </Typography>
                {error && (
                    <Typography color="error" align="center">
                        {error}
                    </Typography>
                )}
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="firstName"
                                label="First Name"
                                fullWidth
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="lastName"
                                label="Last Name"
                                fullWidth
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="username"
                                label="Username"
                                fullWidth
                                required
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="email"
                                label="Email Address"
                                fullWidth
                                required
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="password"
                                label="Password"
                                type="password"
                                fullWidth
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        style={{ marginTop: 20 }}
                    >
                        Sign Up
                    </Button>
                    <Button
                        fullWidth
                        variant="text"
                        onClick={() => navigate('/login')}
                        style={{ marginTop: 10 }}
                    >
                        Already have an account? Sign in
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default SignUp;
