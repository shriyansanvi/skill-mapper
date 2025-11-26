import React from 'react';
import { Container, Typography, Box, Button, Grid, Paper, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';

// Professional Icons
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function ConnectGuide() {
  const steps = [
    {
      step: "01",
      title: "Complete Your Profile",
      subtitle: "First impressions matter",
      desc: "Employers trust transparency. Ensure you have a profile photo, a clear bio (use our AI tool!), and a list of your key skills. A complete profile gets 3x more views.",
      icon: <PersonRoundedIcon fontSize="large" />,
      color: '#d32f2f', // Professional Red
    },
    {
      step: "02",
      title: "Search Strategically",
      subtitle: "Find the right fit",
      desc: "Use the 'Jobs Around You' section. Filter opportunities by 'Part-time' or 'Contract' to find work that fits your schedule and location.",
      icon: <SearchRoundedIcon fontSize="large" />,
      color: '#1976d2', // Blue
    },
    {
      step: "03",
      title: "Reach Out Professionally",
      subtitle: "Make the connection",
      desc: "When applying, be brief and polite. State your name, your specific skill (e.g., 'Tailoring'), and your availability. Professional communication builds immediate respect.",
      icon: <ChatRoundedIcon fontSize="large" />,
      color: '#2e7d32', // Green
    },
    {
      step: "04",
      title: "Join a Self-Help Group",
      subtitle: "Power in numbers",
      desc: "Don't just look for jobs; look for communities. Joining a local SHG connects you with mentors, bulk orders, and government schemes.",
      icon: <GroupsRoundedIcon fontSize="large" />,
      color: '#7b1fa2', // Purple
    }
  ];

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* --- Modern Hero Section --- */}
      <Box sx={{ bgcolor: '#fff', py: 8, borderBottom: '1px solid #e0e0e0' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="overline" sx={{ fontWeight: 'bold', color: '#c62828', letterSpacing: 1.5 }}>
            CAREER STRATEGY
          </Typography>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: '800', color: '#2d3748', mt: 1 }}>
            Connect with Confidence
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'normal', maxWidth: '700px', mx: 'auto', lineHeight: 1.6 }}>
            Finding the right opportunity isn't just about luck. It's about presentation and strategy. Follow these steps to secure work with trusted employers.
          </Typography>
        </Container>
      </Box>

      {/* --- Feature Grid (Vertical Stack) --- */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {steps.map((item, index) => (
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
              Ready to find work?
            </Typography>
            <Typography variant="body1" sx={{ color: '#a0aec0', mb: 4, maxWidth: '500px', mx: 'auto' }}>
              Update your profile and browse the latest opportunities in your area.
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

export default ConnectGuide;