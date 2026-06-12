import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Box, Grid, Card, CardContent, Chip, 
  Button, CircularProgress, Alert, Tab, Tabs, Paper, Stack, Divider, 
  TextField, InputAdornment, Avatar 
} from '@mui/material';
import { Link } from 'react-router-dom';

// Icons
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

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
  const [tabValue, setTabValue] = useState(0); 
  const [jobs, setJobs] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ bgcolor: '#e3f2fd', minHeight: '100vh', pb: 8 }}>
      
      {/* --- Header --- */}
      <Box sx={{ bgcolor: '#fff', py: 6, borderBottom: '1px solid #e2e8f0' }}>
        {/* Changed to 'md' so the vertical list isn't too wide */}
        <Container maxWidth="md"> 
          <Typography variant="overline" sx={{ fontWeight: 'bold', color: '#1976d2', letterSpacing: 1 }}>
            OPPORTUNITIES
          </Typography>
          <Typography variant="h3" fontWeight="800" color="#0f172a" gutterBottom sx={{ mt: 1 }}>
            Explore & Connect
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight="normal" sx={{ maxWidth: '600px', mb: 4 }}>
            Browse hundreds of local jobs and community groups.
          </Typography>

          <Paper elevation={0} sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%', border: '1px solid #cbd5e1', borderRadius: 3 }}>
            <InputAdornment position="start" sx={{ pl: 2 }}><SearchIcon color="action" /></InputAdornment>
            <TextField
              sx={{ ml: 1, flex: 1, "& fieldset": { border: 'none' } }}
              placeholder="Search..."
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Paper>
        </Container>
      </Box>

      {/* --- Main Content --- */}
      <Container maxWidth="md" sx={{ mt: 4 }}>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 5 }}>
          <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
            <Tab label={`Jobs (${filteredJobs.length})`} sx={{ fontWeight: 'bold' }} />
            <Tab label={`Self-Help Groups (${filteredGroups.length})`} sx={{ fontWeight: 'bold' }} />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            {/* --- JOBS TAB --- */}
            {tabValue === 0 && (
              <Grid container spacing={3}>
                {filteredJobs.length === 0 && <Grid item size={{ xs: 12 }}><Typography align="center">No jobs found.</Typography></Grid>}
                {filteredJobs.map((job) => (
                  // CHANGE: size={{ xs: 12 }} forces it to be a vertical list (1 column)
                  <Grid size={{ xs: 12 }} key={job.id}>
                    <Card 
                      elevation={0} 
                      sx={{ 
                        display: 'flex', flexDirection: 'column', 
                        border: '1px solid #e2e8f0', borderRadius: 4, 
                        bgcolor: '#ffffff', 
                        transition: '0.2s', '&:hover': { borderColor: '#1976d2', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                          <Chip label={job.job_type} color={getJobTypeColor(job.job_type)} size="small" />
                          <Typography variant="caption" color="text.secondary">Posted recently</Typography>
                        </Stack>
                        
                        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                          <Avatar sx={{ bgcolor: '#f0f9ff', color: '#0288d1' }}><WorkOutlineRoundedIcon /></Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">{job.title}</Typography>
                            <Typography variant="body2" color="text.secondary">{job.company_name}</Typography>
                          </Box>
                        </Stack>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box display="flex" alignItems="center" gap={1}>
                             <PlaceRoundedIcon fontSize="small" color="action" />
                             <Typography variant="body2">{job.location}</Typography>
                          </Box>
                          <Button component={Link} to={`/jobs/${job.id}`} variant="contained" size="small" sx={{ textTransform: 'none', bgcolor: '#1976d2' }}>View Details</Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* --- GROUPS TAB --- */}
            {tabValue === 1 && (
              <Grid container spacing={3}>
                {filteredGroups.length === 0 && <Grid item size={{ xs: 12 }}><Typography align="center">No groups found.</Typography></Grid>}
                {filteredGroups.map((group) => (
                  // CHANGE: size={{ xs: 12 }} forces it to be a vertical list
                  <Grid size={{ xs: 12 }} key={group.id}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 3, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#ffffff',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: '0.2s', '&:hover': { borderColor: '#90caf9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } 
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', width: 56, height: 56 }}><Diversity3RoundedIcon /></Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">{group.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{group.member_count} Members • {group.topic}</Typography>
                        </Box>
                      </Box>
                      
                      <Button component={Link} to={`/groups/${group.id}`} variant="outlined" size="small" sx={{ color: '#7b1fa2', borderColor: '#7b1fa2' }}>Join Group</Button>
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