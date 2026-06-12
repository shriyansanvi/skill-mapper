import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import {
  Button, TextField, Box, Typography, Alert, CircularProgress, Paper, InputAdornment, IconButton
} from '@mui/material';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setError('');
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(msg);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, sm: 5 },
          borderRadius: 4,
          width: '100%',
          maxWidth: 420,
          bgcolor: '#1e293b',
          border: '1px solid #334155',
        }}
      >
        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
          <WorkOutlineRoundedIcon sx={{ color: '#38bdf8', fontSize: 28 }} />
          <Typography variant="h5" fontWeight="800" color="white">
            Skill<Box component="span" sx={{ color: '#38bdf8' }}>Mapper</Box>
          </Typography>
        </Box>

        <Typography variant="h5" fontWeight="700" color="white" gutterBottom>
          Welcome back
        </Typography>
        <Typography variant="body2" color="#94a3b8" sx={{ mb: 3 }}>
          Sign in to access your dashboard
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleLogin}>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            sx={darkFieldStyle}
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: '#94a3b8' }}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={darkFieldStyle}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            sx={{
              mt: 3, mb: 2,
              bgcolor: '#38bdf8', color: '#0f172a',
              fontWeight: 'bold', textTransform: 'none', borderRadius: 2,
              '&:hover': { bgcolor: '#0ea5e9' },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#0f172a' }} /> : 'Sign In'}
          </Button>
        </Box>

        <Typography variant="body2" color="#94a3b8" align="center">
          Don't have an account?{' '}
          <Box component={Link} to="/register" sx={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
            Create one
          </Box>
        </Typography>
      </Paper>
    </Box>
  );
}

const darkFieldStyle = {
  '& label': { color: '#64748b' },
  '& label.Mui-focused': { color: '#38bdf8' },
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': { borderColor: '#334155' },
    '&:hover fieldset': { borderColor: '#475569' },
    '&.Mui-focused fieldset': { borderColor: '#38bdf8' },
  },
};

export default LoginPage;