import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Button, Box, Typography, Alert, CircularProgress, TextField, 
  Grid, Card, CardContent, Chip, Tabs, Tab, MenuItem 
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const API_URL = 'http://127.0.0.1:8000';

function EmployerDashboard({ token, onLogout }) {
  const [tabValue, setTabValue] = useState(0); // 0 = My Jobs, 1 = Search Candidates
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Job Posting State ---
  const [myJobs, setMyJobs] = useState([]);
  const [jobForm, setJobForm] = useState({
    title: '',
    company_name: '',
    location: '',
    job_type: 'Full-time',
    description: ''
  });
  
  // --- Candidate Search State ---
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Fetch Data ---
  const fetchMyJobs = () => {
    // Ideally, you'd filter this by user on the backend, 
    // but for now we'll fetch all and filter locally or just show recent posts.
    // Note: A real production app would have an endpoint like /api/my-jobs/
    axios.get(`${API_URL}/api/jobs/`)
      .then(res => {
        // Filter to show only jobs posted by this user? 
        // Since the standard API returns everything, we'll just show all for now 
        // to keep it simple, or you can rely on the backend update later.
        setMyJobs(res.data); 
      })
      .catch(err => console.error(err));
  };

  const fetchCandidates = (skill = '') => {
    setLoading(true);
    let url = `${API_URL}/api/search/`;
    if (skill) url += `?skill=${skill}`;

    axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => {
        setCandidates(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (tabValue === 0) fetchMyJobs();
    if (tabValue === 1) fetchCandidates();
  }, [tabValue]);

  // --- Handle Post Job ---
  const handlePostJob = (e) => {
    e.preventDefault();
    setLoading(true);
    
    axios.post(`${API_URL}/api/jobs/`, jobForm, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      setLoading(false);
      setJobForm({ title: '', company_name: '', location: '', job_type: 'Full-time', description: '' });
      alert("Job Posted Successfully!");
      fetchMyJobs(); // Refresh list
    })
    .catch(err => {
      console.error(err);
      setError("Failed to post job.");
      setLoading(false);
    });
  };

  const handleInputChange = (e) => {
    setJobForm({ ...jobForm, [e.target.name]: e.target.value });
  };

  return (
    <Box sx={{ pb: 8 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e65100' }}>
          Employer Dashboard
        </Typography>
        <Button variant="outlined" color="error" onClick={onLogout}>Logout</Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} textColor="inherit">
          <Tab label="Post & Manage Jobs" icon={<WorkIcon />} iconPosition="start" />
          <Tab label="Search Candidates" icon={<PersonIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* --- TAB 1: POST JOBS --- */}
      {tabValue === 0 && (
        <Grid container spacing={4}>
          {/* Left: Post Job Form */}
          <Grid item xs={12} md={5}>
            <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">Post a New Job</Typography>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              
              <form onSubmit={handlePostJob}>
                <TextField label="Job Title" name="title" fullWidth margin="normal" required value={jobForm.title} onChange={handleInputChange} />
                <TextField label="Company Name" name="company_name" fullWidth margin="normal" required value={jobForm.company_name} onChange={handleInputChange} />
                <TextField label="Location" name="location" fullWidth margin="normal" required value={jobForm.location} onChange={handleInputChange} />
                
                <TextField select label="Job Type" name="job_type" fullWidth margin="normal" value={jobForm.job_type} onChange={handleInputChange}>
                  <MenuItem value="Full-time">Full-time</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                </TextField>

                <TextField label="Description" name="description" fullWidth multiline rows={4} margin="normal" required value={jobForm.description} onChange={handleInputChange} />

                <Button type="submit" variant="contained" fullWidth size="large" startIcon={<AddCircleIcon />} sx={{ mt: 2, bgcolor: '#e65100', '&:hover': { bgcolor: '#bf360c' } }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Post Job"}
                </Button>
              </form>
            </Card>
          </Grid>

          {/* Right: Recent Jobs List */}
          <Grid item xs={12} md={7}>
            <Typography variant="h6" gutterBottom fontWeight="bold">Recent Job Postings</Typography>
            {myJobs.map(job => (
              <Card key={job.id} sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6" fontWeight="bold">{job.title}</Typography>
                    <Chip label={job.job_type} size="small" color="primary" variant="outlined" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">{job.company_name} • {job.location}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>{job.description.substring(0, 100)}...</Typography>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Grid>
      )}

      {/* --- TAB 2: SEARCH CANDIDATES --- */}
      {tabValue === 1 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <TextField 
              label="Search by Skill (e.g. Tailoring)" 
              variant="outlined" 
              fullWidth 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="contained" onClick={() => fetchCandidates(searchTerm)} sx={{ px: 4, bgcolor: '#e65100' }}>
              Search
            </Button>
          </Box>

          <Grid container spacing={3}>
            {candidates.map(resume => (
              <Grid item xs={12} md={6} key={resume.id}>
                <Card sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="h6" fontWeight="bold">{resume.full_name || "Artisan"}</Typography>
                      {resume.is_verified && <Chip label="Verified" color="success" size="small" />}
                    </Box>
                    <Typography variant="body2" color="text.secondary">{resume.location}</Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>{resume.bio}</Typography>
                    <Box sx={{ mt: 2 }}>
                      {resume.skills && resume.skills.map(skill => (
                        <Chip key={skill.id} label={skill.name} sx={{ mr: 1, mb: 1 }} />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

    </Box>
  );
}

export default EmployerDashboard;