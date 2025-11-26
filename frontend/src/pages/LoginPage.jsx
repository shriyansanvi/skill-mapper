import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx'; // Import the hook
import { useNavigate, Link } from 'react-router-dom'; // Import hooks for navigation
import { Button, TextField, Box, Typography, Alert, CircularProgress } from '@mui/material';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, loading } = useAuth(); // Get login function and state from context
  const navigate = useNavigate(); // Hook to change page

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(username, password);
      navigate('/dashboard'); // On success, go to dashboard
    } catch (error) {
      setError("Login failed. Please check your username and password.");
    }
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleLogin} 
      sx={{ p: 4, bgcolor: '#f7f7f7', borderRadius: 2, boxShadow: 3, maxWidth: 'md', mx: 'auto' }}
    >
      <Typography variant="h4" component="h2" gutterBottom>
        Login
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {/* ... (Your TextField components for username and password stay the same) ... */}
      <TextField label="Username" fullWidth margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} />
      <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button 
        type="submit" 
        variant="contained" 
        size="large" 
        fullWidth
        sx={{ mt: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Login'}
      </Button>
      <Button component={Link} to="/register" sx={{ mt: 2 }}>
        Don't have an account? Register
      </Button>
    </Box>
  );
}
export default LoginPage;