import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Container, Button, Box, Card, CardContent, Chip, CircularProgress, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import Slider from "react-slick";

// Import CSS
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// Import icons
import EditNoteIcon from '@mui/icons-material/EditNote';
import ImageIcon from '@mui/icons-material/Image';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import WorkIcon from '@mui/icons-material/Work';
import GroupIcon from '@mui/icons-material/Group';

// API URL
const API_URL = 'http://127.0.0.1:8000';

// --- Static Data ---
const carouselItems = [
  { 
    title: "National Handicrafts Development Programme",
    desc: "Implemented by the Ministry of Textiles, this program focuses on the development of the handicrafts sector.",
    img: "https://images.unsplash.com/photo-1577907573138-1647895e7c80?auto=format&fit=crop&w=1600&q=80" 
  },
  { 
    title: "Showcase Your Craft",
    desc: "From intricate weaving to beautiful pottery, your skills deserve to be seen by the world.",
    img: "https://images.unsplash.com/photo-1510521743633-1110603b5f04?auto=format&fit=crop&w=1600&q=80"
  },
  { 
    title: "Empower Your Community",
    desc: "Join a network of talented artisans and entrepreneurs from rural areas.",
    img: "https://images.unsplash.com/photo-1490367580463-63691a7fde15?auto=format&fit=crop&w=1600&q=80"
  }
];

// --- Feature Cards with Updated Links ---
const features = [
  { 
    title: "Create Your Resume", 
    desc: "Get guidance on building your professional resume and portfolio for employers.",
    icon: <EditNoteIcon fontSize="large" color="primary" />,
    link: "/dashboard" // Goes to dashboard/resume builder
  },
  { 
    title: "Showcase Your Skills", 
    desc: "Highlight your work, upload photos, and make your profile stand out.",
    icon: <ImageIcon fontSize="large" color="success" />,
    link: "/guide/showcase" // Goes to new Showcase Guide
  },
  { 
    title: "Connect with Employers", 
    desc: "Find opportunities tailored to your expertise and local area.",
    icon: <ConnectWithoutContactIcon fontSize="large" color="error" />,
    link: "/guide/connect" // Goes to new Connect Guide
  }
];

// --- Job Type Color Helper ---
const getJobTypeColor = (jobType) => {
  switch (jobType) {
    case 'Full-time': return 'success';
    case 'Part-time': return 'warning';
    case 'Contract': return 'info';
    default: return 'default';
  }
};

function Homepage() {
  // --- State for Dynamic Data ---
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState('');
  
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState('');

  // --- Fetch Data on Page Load ---
  useEffect(() => {
    // Fetch Jobs
    axios.get(`${API_URL}/api/jobs/`)
      .then(response => {
        setJobs(response.data);
        setJobsLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch jobs!", error);
        setJobsError("Could not load job postings.");
        setJobsLoading(false);
      });
      
    // Fetch Groups
    axios.get(`${API_URL}/api/groups/`)
      .then(response => {
        setGroups(response.data);
        setGroupsLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch groups!", error);
        setGroupsError("Could not load self-help groups.");
        setGroupsLoading(false);
      });
  }, []);

  // Carousel settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    fade: true,
    appendDots: dots => (
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: { xs: '20px', md: '30px' }, 
          left: { xs: '20px', md: '50px' }, 
          ul: { margin: "0px", padding: 0, display: 'flex' },
          li: { 
            margin: '0 5px', 
            '& button::before': {
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.7)',
            },
            '&.slick-active button::before': {
              color: 'white',
            }
          }
        }}
      >
        <ul> {dots} </ul>
      </Box>
    ),
  };

  return (
    <Box>
      {/* --- Image Carousel Section --- */}
      <Box sx={{ mb: 8, width: '100%', position: 'relative' }}>
        <Slider {...sliderSettings}>
          {carouselItems.map((item) => (
            <Box key={item.title} sx={{ position: 'relative', height: '400px' }}>
              <Box 
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${item.img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <Box 
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                }}
              />
              <Container 
                maxWidth="lg" 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  alignItems: 'flex-start',
                  position: 'relative',
                  color: 'white',
                  px: { xs: 2, md: 4 } 
                }}
              >
                <Box 
                  sx={{
                    maxWidth: { xs: '100%', md: '50%' },
                  }}
                >
                  <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="h6">
                    {item.desc}
                  </Typography>
                </Box>
              </Container>
            </Box>
          ))}
        </Slider>
      </Box>
      
      {/* Container for the rest of the page content */}
      <Container maxWidth="lg">
        {/* --- "Build Your Future" Section --- */}
        <Box sx={{ textAlign: 'center', my: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Build Your Future
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4, 
              mt: 4 
            }}
          >
            {features.map((feature) => (
              <Card 
                key={feature.title}
                component={Link} 
                to={feature.link} // Uses the updated links
                sx={{ 
                  flex: 1, 
                  p: 2, 
                  boxShadow: 3, 
                  borderRadius: 2,
                  textAlign: 'left',
                  textDecoration: 'none',
                  transition: '0.2s',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: 6,
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {feature.desc}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* --- "Jobs Around You" Section (Dynamic) --- */}
        <Box sx={{ my: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
              Jobs Around You
            </Typography>
            <Button component={Link} to="/dashboard">View All &rarr;</Button>
          </Box>
          
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4,
            }}
          >
            {jobsLoading ? (
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            ) : jobsError ? (
              <Alert severity="error" sx={{ width: '100%' }}>{jobsError}</Alert>
            ) : (
              jobs.map((job) => (
                <Card 
                  key={job.id}
                  sx={{ 
                    flex: 1, 
                    p: 2, 
                    boxShadow: 3, 
                    borderRadius: 2 
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <WorkIcon color="action" />
                      <Chip 
                        label={job.job_type}
                        color={getJobTypeColor(job.job_type)}
                        size="small" 
                      />
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {job.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {job.company_name} - {job.location}
                    </Typography>
                    <Button component={Link} to={`/jobs/${job.id}`} size="small" sx={{ mt: 2 }}>
                      View Details &rarr;
                    </Button> 
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        </Box>

        {/* --- "Self-Help Groups" Section (Dynamic) --- */}
        <Box sx={{ my: 8, bgcolor: '#f7f9fc', p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4 }}>
            Self-Help Groups Near You
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4,
            }}
          >
            {groupsLoading ? (
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            ) : groupsError ? (
              <Alert severity="error" sx={{ width: '100%' }}>{groupsError}</Alert>
            ) : (
              groups.map((group) => (
                <Card 
                  key={group.id}
                  sx={{ 
                    flex: 1, 
                    p: 2, 
                    boxShadow: 2, 
                    borderRadius: 2 
                  }}
                >
                  <CardContent>
                    <GroupIcon color="secondary" sx={{ mb: 2 }} />
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {group.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Topic: {group.topic} | {group.member_count} Members
                    </Typography>
                    <Button 
                      component={Link} 
                      to={`/groups/${group.id}`} 
                      size="small" 
                      sx={{ mt: 2 }}
                    >
                      View & Join &rarr;
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        </Box>
        
      </Container>
    </Box>
  );
}

export default Homepage;