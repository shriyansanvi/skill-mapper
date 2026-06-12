import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import {
  Button, TextField, Box, Typography, Alert, CircularProgress,
  Paper, InputAdornment, IconButton, LinearProgress
} from '@mui/material';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const strength = getPasswordStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    try {
      await register(username, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.username) setError(data.username[0]);
      else if (data?.password) setError(data.password[0]);
      else setError('Registration failed. Please check your inputs.');
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
          <WorkOutlineRoundedIcon sx={{ color: '#38bdf8', fontSize: 28 }} />
          <Typography variant="h5" fontWeight="800" color="white">
            Skill<Box component="span" sx={{ color: '#38bdf8' }}>Mapper</Box>
          </Typography>
        </Box>

        <Typography variant="h5" fontWeight="700" color="white" gutterBottom>
          Create your account
        </Typography>
        <Typography variant="body2" color="#94a3b8" sx={{ mb: 3 }}>
          Join thousands of artisans finding work
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && (
          <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>
            Account created! Redirecting to login…
          </Alert>
        )}

        <Box component="form" onSubmit={handleRegister}>
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
            autoComplete="new-password"
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

          {password && (
            <Box sx={{ mt: 1, mb: 1 }}>
              <LinearProgress
                variant="determinate"
                value={(strength / 4) * 100}
                sx={{
                  height: 4, borderRadius: 2,
                  bgcolor: '#334155',
                  '& .MuiLinearProgress-bar': { bgcolor: strengthColors[strength] },
                }}
              />
              <Typography variant="caption" sx={{ color: strengthColors[strength] }}>
                {strengthLabels[strength]} password
              </Typography>
            </Box>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading || success}
            sx={{
              mt: 3, mb: 2,
              bgcolor: '#38bdf8', color: '#0f172a',
              fontWeight: 'bold', textTransform: 'none', borderRadius: 2,
              '&:hover': { bgcolor: '#0ea5e9' },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#0f172a' }} /> : 'Create Account'}
          </Button>
        </Box>

        <Typography variant="body2" color="#94a3b8" align="center">
          Already have an account?{' '}
          <Box component={Link} to="/login" sx={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
            Sign in
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

export default RegisterPage;