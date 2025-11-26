import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { useAuth } from '../context/AuthContext.jsx';
import { AppBar, Toolbar, Typography, Button, Container, Box, Stack } from '@mui/material';
import Footer from './Footer.jsx';

// Icons
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

function Layout() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Hook to get current URL

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define paths where the Footer should be hidden
  const hideFooterPaths = ['/login', '/register'];
  const showFooter = !hideFooterPaths.includes(location.pathname);

  return (
    // Flex column layout forces the footer to the bottom even if content is short
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* --- Professional Navbar --- */}
      <AppBar 
        position="sticky" 
        elevation={0} 
        sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.9)', 
          backdropFilter: 'blur(8px)', 
          borderBottom: '1px solid #e2e8f0',
          color: '#1e293b' 
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            
            {/* Logo Area */}
            <Box 
              component={Link} 
              to="/" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none', 
                color: '#1976d2', 
                gap: 1 
              }}
            >
              <WorkOutlineIcon sx={{ fontSize: 28 }} />
              <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.5px' }}>
                Skill Mapper
              </Typography>
            </Box>

            {/* Desktop Navigation Links */}
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button component={Link} to="/" color="inherit" sx={{ fontWeight: 600 }}>
                Home
              </Button>
              <Button component={Link} to="/explore" color="inherit" sx={{ fontWeight: 600 }}>
                Explore
              </Button>
              <Button component={Link} to="/dashboard" color="inherit" sx={{ fontWeight: 600 }}>
                Dashboard
              </Button>
            </Stack>

            {/* Auth Buttons */}
            <Box>
              {token ? (
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                >
                  Logout
                </Button>
              ) : (
                <Stack direction="row" spacing={2}>
                  <Button 
                    component={Link} 
                    to="/login" 
                    color="primary" 
                    sx={{ fontWeight: 'bold' }}
                  >
                    Log in
                  </Button>
                  <Button 
                    component={Link} 
                    to="/register" 
                    variant="contained" 
                    disableElevation
                    startIcon={<LoginIcon />}
                    sx={{ 
                      borderRadius: 2, 
                      textTransform: 'none', 
                      fontWeight: 'bold',
                      bgcolor: '#1976d2',
                      '&:hover': { bgcolor: '#1565c0' }
                    }}
                  >
                    Register
                  </Button>
                </Stack>
              )}
            </Box>

          </Toolbar>
        </Container>
      </AppBar>

      {/* --- Main Content Area --- */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f8fafc' }}>
        <Outlet /> 
      </Box>

      {/* --- Footer (Conditionally Rendered) --- */}
      {showFooter && <Footer />}
      
    </Box>
  );
}

export default Layout;