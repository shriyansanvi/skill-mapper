import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Box, Grid, Card, CardContent, Chip, 
  Button, CircularProgress, Alert, Tab, Tabs, Paper, Stack, Divider, 
  TextField, InputAdornment, Avatar // <--- Added Avatar here
} from '@mui/material';
import { Link } from 'react-router-dom';

// Icons
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded';
import SearchIcon from '@mui/icons-material/Search';

const API_URL = 'http://127.0.0.1:8000';

// --- Job Color Helper ---
const getJobTypeColor = (jobType) => {
  switch (jobType) {
    case 'Full-time': return 'success';
    case 'Part-time': return 'warning';
    case 'Contract': return 'info';
    default: return 'default';
  }
};

function ExplorePage() {
  const [tabValue, setTabValue] = useState(0); // 0 for Jobs, 1 for Groups
  const [jobs, setJobs] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Fetch All Data ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [jobRes, groupRes] = await Promise.all([
          axios.get(`${API_URL}/api/jobs/`),
          axios.get(`${API_URL}/api/groups/`)
        ]);
        setJobs(jobRes.data);
        setGroups(groupRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error", err);
        setError("Failed to load data.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Handle Tab Change ---
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // --- Filter Data based on Search ---
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 8 }}>
      
      {/* --- Header --- */}
      <Box sx={{ bgcolor: '#fff', py: 6, borderBottom: '1px solid #e2e8f0' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight="800" color="#0f172a" gutterBottom>
            Explore Opportunities
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight="normal">
            Find the perfect job or community to grow your skills.
          </Typography>

          {/* --- Search Bar --- */}
          <TextField 
            fullWidth 
            variant="outlined"
            placeholder="Search by title, location, or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mt: 4, bgcolor: 'white' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Container>
      </Box>

      {/* --- Tabs --- */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="explore tabs">
            <Tab label="Jobs" sx={{ fontWeight: 'bold', fontSize: '1rem' }} />
            <Tab label="Self-Help Groups" sx={{ fontWeight: 'bold', fontSize: '1rem' }} />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            {/* --- JOBS TAB (Index 0) --- */}
            {tabValue === 0 && (
              <Grid container spacing={3}>
                {filteredJobs.length === 0 && <Typography sx={{ mt: 4, width: '100%', textAlign: 'center' }}>No jobs found.</Typography>}
                {filteredJobs.map((job) => (
                  <Grid item xs={12} md={6} lg={4} key={job.id}>
                    <Card elevation={0} sx={{ height: '100%', border: '1px solid #e2e8f0', borderRadius: 3, transition: '0.2s', '&:hover': { borderColor: '#1976d2', boxShadow: '0 8px 20px -4px rgba(0,0,0,0.1)' } }}>
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" justifyContent="space-between" mb={2}>
                          <Avatar sx={{ bgcolor: '#f0f9ff', color: '#0288d1' }}><WorkOutlineRoundedIcon /></Avatar>
                          <Chip label={job.job_type} color={getJobTypeColor(job.job_type)} size="small" sx={{ fontWeight: 'bold', borderRadius: 1 }} />
                        </Stack>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>{job.title}</Typography>
                        <Stack spacing={1} sx={{ mb: 3, color: 'text.secondary' }}>
                          <Box display="flex" alignItems="center" gap={1}><BusinessRoundedIcon fontSize="small" /><Typography variant="body2">{job.company_name}</Typography></Box>
                          <Box display="flex" alignItems="center" gap={1}><PlaceRoundedIcon fontSize="small" /><Typography variant="body2">{job.location}</Typography></Box>
                        </Stack>
                        <Divider sx={{ mb: 2 }} />
                        <Button component={Link} to={`/jobs/${job.id}`} fullWidth variant="outlined" sx={{ textTransform: 'none', fontWeight: 'bold' }}>View Details</Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* --- GROUPS TAB (Index 1) --- */}
            {tabValue === 1 && (
              <Grid container spacing={3}>
                {filteredGroups.length === 0 && <Typography sx={{ mt: 4, width: '100%', textAlign: 'center' }}>No groups found.</Typography>}
                {filteredGroups.map((group) => (
                  <Grid item xs={12} md={6} lg={4} key={group.id}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 2, transition: '0.2s', '&:hover': { borderColor: '#90caf9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
                      <Avatar sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', width: 56, height: 56 }}><Diversity3RoundedIcon /></Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">{group.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{group.topic} • {group.member_count} Members</Typography>
                      </Box>
                      <Button component={Link} to={`/groups/${group.id}`} variant="contained" size="small" sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}>Join</Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}

export default ExplorePage;