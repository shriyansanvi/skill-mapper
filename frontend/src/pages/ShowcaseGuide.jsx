import React from 'react';
import { Container, Typography, Box, Button, Grid, Paper, Avatar, Divider } from '@mui/material';
import { Link } from 'react-router-dom';

// Icons
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import CropFreeRoundedIcon from '@mui/icons-material/CropFreeRounded';
import CameraEnhanceRoundedIcon from '@mui/icons-material/CameraEnhanceRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function ShowcaseGuide() {
  const steps = [
    {
      step: "01",
      title: "Use Natural Lighting",
      desc: "Avoid flash. Photograph your work near a window during the day. Soft, natural light reveals the true textures and colors of your craft.",
      icon: <WbSunnyRoundedIcon />,
      color: '#ff9800', // Orange
    },
    {
      step: "02",
      title: "Neutral Background",
      desc: "Distractions kill quality. Place your item on a plain white sheet or clean wooden table. Let your product be the only focus.",
      icon: <CropFreeRoundedIcon />,
      color: '#2196f3', // Blue
    },
    {
      step: "03",
      title: "Capture the Details",
      desc: "Don't just take one photo. Take close-ups of the stitching, weaving, or finish. Employers judge quality by the small details.",
      icon: <CameraEnhanceRoundedIcon />,
      color: '#e91e63', // Pink
    },
    {
      step: "04",
      title: "Add a Description",
      desc: "Context matters. When uploading, mention the materials used (e.g., 'Pure Silk') and the time taken to create it.",
      icon: <CloudUploadRoundedIcon />,
      color: '#4caf50', // Green
    }
  ];

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* --- Modern Hero Section --- */}
      <Box sx={{ bgcolor: '#fff', py: 8, borderBottom: '1px solid #e0e0e0' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="overline" sx={{ fontWeight: 'bold', color: '#1976d2', letterSpacing: 1.5 }}>
            PORTFOLIO GUIDE
          </Typography>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: '800', color: '#2d3748', mt: 1 }}>
            Make Your Work Shine
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'normal', maxWidth: '700px', mx: 'auto', lineHeight: 1.6 }}>
            A picture is worth a thousand words. High-quality photos build immediate trust with employers. Follow these 4 standards to look professional.
          </Typography>
        </Container>
      </Box>

      {/* --- Feature Grid (Vertical Stack) --- */}
      <Container maxWidth="md" sx={{ py: 8 }}> {/* Changed maxWidth to 'md' for better vertical readability */}
        <Grid container spacing={4}>
          {steps.map((item, index) => (
            // Changed 'md={6}' to 'xs={12}' to make it full width (vertical)
            <Grid item xs={12} key={index} sx={{ display: 'flex' }}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, 
                  width: '100%',
                  borderRadius: 2,
                  border: '1px solid #eaecf0',
                  borderTop: `4px solid ${item.color}`, // The "Accent" border
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.08)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: item.color + '15', // 15 adds transparency
                      color: item.color, 
                      width: 56, 
                      height: 56,
                      borderRadius: 2
                    }}
                  >
                    {item.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ color: item.color, fontWeight: 'bold' }}>
                      STEP {item.step}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2d3748', mt: 0.5, mb: 1 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* --- Call to Action Box --- */}
        <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
          <Paper 
            sx={{ 
              p: 6, 
              textAlign: 'center', 
              bgcolor: '#1a202c', // Dark professional background
              color: 'white', 
              borderRadius: 4,
              width: '100%',
              maxWidth: '800px'
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              Ready to build your portfolio?
            </Typography>
            <Typography variant="body1" sx={{ color: '#a0aec0', mb: 4, maxWidth: '500px', mx: 'auto' }}>
              Navigate to your dashboard, click "Showcase Your Skills," and upload your first professional photo.
            </Typography>
            <Button 
              component={Link} 
              to="/dashboard" 
              variant="contained" 
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                bgcolor: 'white', 
                color: '#1a202c',
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                '&:hover': { bgcolor: '#f7fafc' }
              }}
            >
              Go to Dashboard
            </Button>
          </Paper>
        </Box>

      </Container>
    </Box>
  );
}

export default ShowcaseGuide;