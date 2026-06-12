import React from 'react';
import { Box, Container, Typography, Link as MuiLink, IconButton, Stack, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';

function Footer() {
  return (
    // Changed background to Professional Dark Slate
    <Box sx={{ bgcolor: '#0f172a', color: '#f1f5f9', py: 8, mt: 'auto' }}>
      <Container maxWidth="lg">
        
        <Stack spacing={5} alignItems="center" textAlign="center">
          
          {/* 1. Brand & Description */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ffffff', mb: 2, letterSpacing: 1 }}>
              Skill Mapper
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, color: '#94a3b8', maxWidth: '600px', mx: 'auto' }}>
              Empowering rural artisans and workers by connecting them with global opportunities. Build your resume, showcase your skills, and find your future.
            </Typography>
          </Box>

          {/* 2. Quick Links */}
          <Stack direction="row" spacing={3} flexWrap="wrap" justifyContent="center">
            <MuiLink component={Link} to="/" color="inherit" underline="none" sx={{ fontWeight: 'medium', '&:hover': { color: '#38bdf8' } }}>Home</MuiLink>
            <MuiLink component={Link} to="/dashboard" color="inherit" underline="none" sx={{ fontWeight: 'medium', '&:hover': { color: '#38bdf8' } }}>Find Jobs</MuiLink>
            <MuiLink component={Link} to="/guide/showcase" color="inherit" underline="none" sx={{ fontWeight: 'medium', '&:hover': { color: '#38bdf8' } }}>Portfolio Guide</MuiLink>
            <MuiLink component={Link} to="/guide/connect" color="inherit" underline="none" sx={{ fontWeight: 'medium', '&:hover': { color: '#38bdf8' } }}>Career Advice</MuiLink>
          </Stack>

          {/* 3. Social Media */}
          <Stack direction="row" spacing={2} justifyContent="center">
            <IconButton sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: '#3b5998' } }}>
              <FacebookIcon />
            </IconButton>
            <IconButton sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: '#1da1f2' } }}>
              <TwitterIcon />
            </IconButton>
            <IconButton sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: '#0077b5' } }}>
              <LinkedInIcon />
            </IconButton>
            <IconButton sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: '#e1306c' } }}>
              <InstagramIcon />
            </IconButton>
          </Stack>

        </Stack>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 5 }} />

        <Typography variant="body2" align="center" color="#64748b">
          © {new Date().getFullYear()} Skill Mapper Initiative. All rights reserved.
        </Typography>

      </Container>
    </Box>
  );
}

export default Footer;