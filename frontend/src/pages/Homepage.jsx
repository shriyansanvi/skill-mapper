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

// --- Hero Carousel Data ---
const carouselItems = [
  { 
    title: "Empowering Rural Artisans",
    desc: "Join the National Handicrafts Development Programme and take your skills to the global stage.",
    img: "https://media.istockphoto.com/id/1521121142/photo/group-of-happy-young-traditional-indian-women-wearing-colorful-sari-join-hands-with-each.webp?a=1&b=1&s=612x612&w=0&k=20&c=s-JVEjBXQbZlk3FffUD_hzrUga-LlgT2578sUL4P90Y=" 
  },
  { 
    title: "Showcase Your Craft",
    desc: "From intricate weaving to beautiful pottery, your skills deserve to be seen by the world.",
    img: "https://images.unsplash.com/photo-1680777019951-9cc1abaa0471?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  { 
    title: "Connect & Grow",
    desc: "Join a network of talented artisans and entrepreneurs from rural areas.",
    img: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1600&q=80"
  }
];

// --- Feature Cards with COLORS ---
const features = [
  { 
    title: "Create Your Resume", 
    desc: "Get guidance on building your professional resume and portfolio for employers.",
    icon: <EditNoteIcon fontSize="large" color="primary" />,
    link: "/dashboard",
    bg: '#e3f2fd', // Light Blue Background
    border: '#90caf9' // Blue Border
  },
  { 
    title: "Showcase Your Skills", 
    desc: "Highlight your work, upload photos, and make your profile stand out.",
    icon: <ImageIcon fontSize="large" color="success" />,
    link: "/guide/showcase",
    bg: '#e8f5e9', // Light Green Background
    border: '#a5d6a7' // Green Border
  },
  { 
    title: "Connect with Employers", 
    desc: "Find opportunities tailored to your expertise and local area.",
    icon: <ConnectWithoutContactIcon fontSize="large" color="error" />,
    link: "/guide/connect",
    bg: '#fff3e0', // Light Orange Background
    border: '#ffcc80' // Orange Border
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
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState('');
  
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState('');

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

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    fade: true,
    arrows: false,
    appendDots: dots => (
      <Box sx={{ position: 'absolute', bottom: '20px', width: '100%', display: 'flex', justifyContent: 'center', padding: 0, '& ul': { margin: 0, padding: 0, display: 'flex' }, '& li': { margin: '0 5px', '& button::before': { fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', opacity: 1 }, '&.slick-active button::before': { color: 'white', fontSize: '14px' } } }}>
        <ul> {dots} </ul>
      </Box>
    ),
  };

  return (
    <Box sx={{ bgcolor: '#eef2ff', minHeight: '100vh', pb: 8 }}>
      
      {/* --- Image Carousel Section --- */}
      <Box sx={{ mb: 8, width: '100%', position: 'relative' }}>
        <Slider {...sliderSettings}>
          {carouselItems.map((item) => (
            <Box key={item.title} sx={{ position: 'relative', height: '500px', outline: 'none' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url(${item.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
              <Container maxWidth="lg" sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', color: 'white', textAlign: 'center', px: 2 }}>
                <Box sx={{ maxWidth: '800px' }}>
                  <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{item.title}</Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>{item.desc}</Typography>
                </Box>
              </Container>
            </Box>
          ))}
        </Slider>
      </Box>
      
      <Container maxWidth="lg">
        {/* --- "Build Your Future" Section --- */}
        <Box sx={{ textAlign: 'center', my: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e' }}>Build Your Future</Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mt: 4 }}>
            {features.map((feature) => (
              <Card 
                key={feature.title}
                component={Link} 
                to={feature.link}
                sx={{ 
                  flex: 1, p: 2, boxShadow: 1, borderRadius: 2, textAlign: 'left', textDecoration: 'none', 
                  bgcolor: feature.bg, border: `1px solid ${feature.border}`,
                  transition: '0.2s', '&:hover': { transform: 'scale(1.03)', boxShadow: 4 }
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>{feature.title}</Typography>
                  <Typography variant="body2" color="textSecondary">{feature.desc}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* --- "Jobs Around You" Section --- */}
        <Box sx={{ my: 8, bgcolor: '#ffffff', p: 4, borderRadius: 2, boxShadow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: '#1a237e' }}>Jobs Around You</Typography>
            {/* CHANGE: Link to /explore to see all jobs */}
            <Button component={Link} to="/explore">View All &rarr;</Button>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            {jobsLoading ? (
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            ) : jobsError ? (
              <Alert severity="error" sx={{ width: '100%' }}>{jobsError}</Alert>
            ) : (
              // CHANGE: .slice(0, 3) limits the display to 3 items
              jobs.slice(0, 3).map((job) => (
                <Card 
                  key={job.id}
                  sx={{ flex: 1, p: 2, boxShadow: 2, borderRadius: 2, bgcolor: '#f9fafb', border: '1px solid #eee' }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <WorkIcon color="action" />
                      <Chip label={job.job_type} color={getJobTypeColor(job.job_type)} size="small" />
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>{job.title}</Typography>
                    <Typography variant="body2" color="textSecondary">{job.company_name} - {job.location}</Typography>
                    <Button component={Link} to={`/jobs/${job.id}`} size="small" sx={{ mt: 2 }}>View Details &rarr;</Button> 
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        </Box>

        {/* --- "Self-Help Groups" Section --- */}
        <Box sx={{ my: 8, bgcolor: '#e0e7ff', p: 4, borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4, color: '#1a237e' }}>
            Self-Help Groups Near You
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            {groupsLoading ? (
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            ) : groupsError ? (
              <Alert severity="error" sx={{ width: '100%' }}>{groupsError}</Alert>
            ) : (
              // CHANGE: .slice(0, 3) limits to 3 items
              groups.slice(0, 3).map((group) => (
                <Card 
                  key={group.id}
                  sx={{ flex: 1, p: 2, boxShadow: 1, borderRadius: 2, bgcolor: '#ffffff' }}
                >
                  <CardContent>
                    <GroupIcon color="secondary" sx={{ mb: 2 }} />
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>{group.name}</Typography>
                    <Typography variant="body2" color="textSecondary">Topic: {group.topic} | {group.member_count} Members</Typography>
                    <Button component={Link} to={`/groups/${group.id}`} size="small" sx={{ mt: 2, color: '#7b1fa2' }}>View & Join &rarr;</Button>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
          {/* CHANGE: Added View All button for Groups */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
             <Button component={Link} to="/explore" variant="contained" sx={{ bgcolor: '#1a237e' }}>View All Groups &rarr;</Button>
          </Box>
        </Box>
        
      </Container>
    </Box>
  );
}

export default Homepage;