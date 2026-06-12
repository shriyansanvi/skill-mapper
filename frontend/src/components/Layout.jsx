import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  AppBar, Toolbar, Typography, Button, Container, Box, Stack,
  IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Divider
} from '@mui/material';
import Footer from './Footer.jsx';
import MenuIcon from '@mui/icons-material/Menu';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Explore', to: '/explore' },
  { label: 'Dashboard', to: '/dashboard' },
];

const HIDE_FOOTER_PATHS = ['/login', '/register'];

function Layout() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDrawerOpen(false);
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const showFooter = !HIDE_FOOTER_PATHS.includes(location.pathname);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ bgcolor: '#0f172a', borderBottom: '1px solid #1e293b', color: 'white' }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: '70px' }}>
            {/* Logo */}
            <Box
              component={Link}
              to="/"
              sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'white', gap: 1.5 }}
            >
              <WorkOutlineRoundedIcon sx={{ fontSize: 28, color: '#38bdf8' }} />
              <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.5px' }}>
                Skill<Box component="span" sx={{ color: '#38bdf8' }}>Mapper</Box>
              </Typography>
            </Box>

            {/* Desktop Nav */}
            <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
              {NAV_LINKS.map(({ label, to }) => (
                <Button
                  key={to}
                  component={Link}
                  to={to}
                  sx={{
                    fontWeight: 600,
                    color: isActive(to) ? 'white' : '#94a3b8',
                    borderBottom: isActive(to) ? '2px solid #38bdf8' : '2px solid transparent',
                    borderRadius: 0,
                    px: 2,
                    '&:hover': { color: 'white', bgcolor: 'transparent' },
                  }}
                >
                  {label}
                </Button>
              ))}
            </Stack>

            {/* Desktop Auth */}
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              {token ? (
                <Button
                  variant="outlined"
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    '&:hover': { bgcolor: 'rgba(239,68,68,0.1)', borderColor: '#ef4444' },
                  }}
                >
                  Logout
                </Button>
              ) : (
                <Stack direction="row" spacing={2}>
                  <Button component={Link} to="/login" sx={{ fontWeight: 'bold', color: '#94a3b8', '&:hover': { color: 'white' } }}>
                    Log in
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    disableElevation
                    startIcon={<LoginIcon />}
                    sx={{
                      borderRadius: 2, textTransform: 'none', fontWeight: 'bold',
                      bgcolor: '#38bdf8', color: '#0f172a', px: 3,
                      '&:hover': { bgcolor: '#0ea5e9' },
                    }}
                  >
                    Register
                  </Button>
                </Stack>
              )}
            </Box>

            {/* Mobile Menu */}
            <IconButton
              sx={{ display: { xs: 'flex', md: 'none' }, color: 'white' }}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, bgcolor: '#0f172a', height: '100%', color: 'white', p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            {NAV_LINKS.map(({ label, to }) => (
              <ListItem key={to} disablePadding>
                <ListItemButton
                  component={Link}
                  to={to}
                  onClick={() => setDrawerOpen(false)}
                  sx={{
                    borderRadius: 1, mb: 0.5,
                    bgcolor: isActive(to) ? '#1e293b' : 'transparent',
                    '&:hover': { bgcolor: '#1e293b' },
                  }}
                >
                  <ListItemText primary={label} sx={{ color: isActive(to) ? '#38bdf8' : '#cbd5e1' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ borderColor: '#1e293b', my: 2 }} />
          {token ? (
            <Button fullWidth variant="outlined" color="error" onClick={handleLogout} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          ) : (
            <Stack spacing={1}>
              <Button fullWidth component={Link} to="/login" onClick={() => setDrawerOpen(false)} sx={{ color: '#cbd5e1', border: '1px solid #334155' }}>
                Log in
              </Button>
              <Button fullWidth component={Link} to="/register" onClick={() => setDrawerOpen(false)} variant="contained" sx={{ bgcolor: '#38bdf8', color: '#0f172a' }}>
                Register
              </Button>
            </Stack>
          )}
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f8fafc' }}>
        <Outlet />
      </Box>

      {showFooter && <Footer />}
    </Box>
  );
}

export default Layout;