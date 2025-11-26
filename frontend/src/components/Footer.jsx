import React from 'react';
import { Box, Container, Typography, Link as MuiLink, IconButton, Stack, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';

function Footer() {
  return (
    <Box sx={{ bgcolor: '#1a202c', color: '#e2e8f0', py: 8, mt: 'auto' }}>
      <Container maxWidth="sm"> {/* Narrower container for vertical layout */}
        
        <Stack spacing={5} alignItems="center" textAlign="center">
          
          {/* 1. Brand & Description */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#fff', mb: 2 }}>
              Skill Mapper
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, color: '#a0aec0' }}>
              Empowering rural artisans and workers by connecting them with global opportunities. Build your resume, showcase your skills, and find your future.
            </Typography>
          </Box>

          {/* 2. Quick Links (Horizontal row for better vertical look) */}
          <Stack direction="row" spacing={3} flexWrap="wrap" justifyContent="center">
            <MuiLink component={Link} to="/" color="inherit" underline="hover" sx={{ fontWeight: 'medium' }}>Home</MuiLink>
            <MuiLink component={Link} to="/dashboard" color="inherit" underline="hover" sx={{ fontWeight: 'medium' }}>Find Jobs</MuiLink>
            <MuiLink component={Link} to="/guide/showcase" color="inherit" underline="hover" sx={{ fontWeight: 'medium' }}>Portfolio Guide</MuiLink>
            <MuiLink component={Link} to="/guide/connect" color="inherit" underline="hover" sx={{ fontWeight: 'medium' }}>Career Advice</MuiLink>
          </Stack>

          {/* 3. Social Media & Contact */}
          <Box>
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
              <IconButton sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: '#1976d2' } }}>
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
            <Typography variant="body2" sx={{ color: '#718096' }}>
              support@skillmapper.com
            </Typography>
          </Box>

        </Stack>

        <Divider sx={{ borderColor: '#2d3748', my: 4 }} />

        <Typography variant="body2" align="center" color="#718096">
          © {new Date().getFullYear()} Skill Mapper Initiative. All rights reserved.
        </Typography>

      </Container>
    </Box>
  );
}

export default Footer;