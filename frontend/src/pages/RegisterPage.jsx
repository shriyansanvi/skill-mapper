import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Box, Typography, Alert, CircularProgress } from '@mui/material';

const API_URL = 'http://127.0.0.1:8000';

function Register({ onRegisterSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    axios.post(`${API_URL}/api/register/`, {
      username: username,
      password: password
    })
    .then(response => {
      setLoading(false);
      // Call the function passed from App.jsx to switch back to login
      onRegisterSuccess(); 
    })
    .catch(error => {
      console.error("Registration error!", error.response.data);
      // Get the error message from Django
      const errorData = error.response.data;
      if (errorData.username) {
        setError(errorData.username[0]); // e.g., "A user with that username already exists."
      } else if (errorData.password) {
        setError(errorData.password[0]); // e.g., "This password is too common."
      } else {
        setError("Registration failed. Please check your inputs.");
      }
      setLoading(false);
    });
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleRegister} 
      sx={{ p: 4, bgcolor: '#f7f7f7', borderRadius: 2, boxShadow: 3, maxWidth: 'md', mx: 'auto' }}
    >
      <Typography variant="h4" component="h2" gutterBottom>
        Register
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button 
        type="submit" 
        variant="contained" 
        size="large" 
        fullWidth
        sx={{ mt: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Register'}
      </Button>
    </Box>
  );
}

export default Register;