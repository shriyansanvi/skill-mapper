import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Button, Box, Typography, Alert, CircularProgress, TextField, 
  Grid, Card, CardContent, Chip, Tabs, Tab, MenuItem, Container, Avatar, Divider, Paper, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogActions, Stack 
} from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'; 
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';

const API_URL = 'http://127.0.0.1:8000';

function EmployerDashboard() {
  const { token, logout } = useAuth(); 
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [tabValue, setTabValue] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [error, setError] = useState('');

  const [myJobs, setMyJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  
  // --- Modal State ---
  const [selectedApp, setSelectedApp] = useState(null); 
  const [statusLoading, setStatusLoading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [jobForm, setJobForm] = useState({
    title: '', company_name: '', location: '', job_type: 'Full-time', description: ''
  });

  // --- Fetching Logic ---
  const fetchMyJobs = () => {
    axios.get(`${API_URL}/api/jobs/?mine=true`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => setMyJobs(res.data))
      .catch(err => console.error(err));
  };

  const fetchCandidates = (skill = '') => {
    setLoading(true);
    let url = `${API_URL}/api/search/`;
    if (skill) url += `?skill=${skill}`;
    axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => { setCandidates(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  const fetchApplications = () => {
    setLoading(true);
    axios.get(`${API_URL}/api/applications/`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => { setApplications(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => {
    if (token) {
        if (tabValue === 0) fetchMyJobs();
        if (tabValue === 1) fetchApplications();
        if (tabValue === 2) fetchCandidates();
    }
  }, [tabValue, token]);

  // --- Handlers ---
  const handlePostJob = (e) => {
    e.preventDefault();
    setLoading(true);
    setPostSuccess(false);
    axios.post(`${API_URL}/api/jobs/`, jobForm, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(() => {
      setLoading(false);
      setPostSuccess(true);
      setSnackbarOpen(true);
      setJobForm({ title: '', company_name: '', location: '', job_type: 'Full-time', description: '' });
      fetchMyJobs(); 
      setTimeout(() => { setPostSuccess(false); }, 2000);
    })
    .catch(() => { setError("Failed to post job."); setLoading(false); });
  };
  
  const handleInputChange = (e) => setJobForm({ ...jobForm, [e.target.name]: e.target.value });
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const handleStatusChange = (newStatus) => {
    if(!selectedApp) return;
    setStatusLoading(true);
    axios.patch(`${API_URL}/api/applications/${selectedApp.id}/`, 
      { status: newStatus }, 
      { headers: { 'Authorization': `Bearer ${token}` } }
    ).then(res => {
      setSelectedApp(res.data);
      fetchApplications(); 
      setStatusLoading(false);
    }).catch(err => {
      console.error(err);
      alert("Failed to update status.");
      setStatusLoading(false);
    });
  };

  const handleViewCandidate = (candidate) => {
    setSelectedApp({
      id: null, 
      applicant_name: candidate.full_name || "Artisan",
      applicant_location: candidate.location,
      applicant_bio: candidate.bio,
      applicant_experience: candidate.experience,
      applicant_education: candidate.education,
      applicant_skills: candidate.skills,
      applicant_email: candidate.contact_email, 
      applicant_phone: candidate.contact_phone, 
      quiz_score: null,
      status: 'Search View' 
    });
  };

  return (
    // FIXED: maxWidth="sm" keeps it compact and centered (not stretched)
    <Container maxWidth="md" sx={{ pb: 8 }}>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1565c0' }}>Employer Dashboard</Typography>
        <Button variant="outlined" color="error" onClick={logout}>Logout</Button>
      </Box>

      <Paper elevation={0} sx={{ mb: 4, borderBottom: 1, borderColor: 'divider', bgcolor: 'transparent' }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} textColor="primary" indicatorColor="primary" variant="scrollable" scrollButtons="auto">
          <Tab label="Post & Manage Jobs" icon={<BusinessIcon />} iconPosition="start" sx={{ fontWeight: 'bold', textTransform: 'none' }} />
          <Tab label="Applications" icon={<AssignmentIndIcon />} iconPosition="start" sx={{ fontWeight: 'bold', textTransform: 'none' }} />
          <Tab label="Search Candidates" icon={<SearchIcon />} iconPosition="start" sx={{ fontWeight: 'bold', textTransform: 'none' }} />
        </Tabs>
      </Paper>

      {/* --- TAB 0: POST JOBS --- */}
      {tabValue === 0 && (
        <Box>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 6 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1565c0' }}><AddCircleIcon /></Avatar>
              <Typography variant="h6" fontWeight="bold">Post a New Job</Typography>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <form onSubmit={handlePostJob}>
              {/* FIXED: size={{ xs: 12 }} forces all fields to be vertical (stacked) */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}><TextField label="Job Title" name="title" fullWidth required value={jobForm.title} onChange={handleInputChange} /></Grid>
                <Grid size={{ xs: 12 }}><TextField label="Company Name" name="company_name" fullWidth required value={jobForm.company_name} onChange={handleInputChange} /></Grid>
                <Grid size={{ xs: 12 }}><TextField label="Location" name="location" fullWidth required value={jobForm.location} onChange={handleInputChange} /></Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField select label="Job Type" name="job_type" fullWidth value={jobForm.job_type} onChange={handleInputChange}>
                    <MenuItem value="Full-time">Full-time</MenuItem><MenuItem value="Part-time">Part-time</MenuItem><MenuItem value="Contract">Contract</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}><TextField label="Job Description" name="description" fullWidth multiline rows={4} required value={jobForm.description} onChange={handleInputChange} /></Grid>
              </Grid>
              
              <Button type="submit" variant="contained" size="large" fullWidth disabled={loading || postSuccess} startIcon={postSuccess ? <CheckCircleIcon /> : null} sx={{ mt: 4, fontWeight: 'bold', bgcolor: postSuccess ? '#2e7d32' : '#1565c0', '&:hover': { bgcolor: postSuccess ? '#1b5e20' : '#0d47a1' }, transition: 'all 0.3s ease' }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : postSuccess ? "Posted!" : "Post Job"}
              </Button>
            </form>
          </Paper>
          
          <Divider textAlign="left" sx={{ mb: 3 }}><Chip label="Your Posted Jobs" /></Divider>
          
          {myJobs.map(job => (
            <Card key={job.id} sx={{ mb: 2, borderRadius: 2, boxShadow: 1, border: '1px solid #eee' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between"><Typography variant="h6" fontWeight="bold" color="#1565c0">{job.title}</Typography><Chip label={job.job_type} size="small" color="primary" variant="outlined" /></Box>
                <Typography variant="body2" color="text.secondary">{job.company_name} • {job.location}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* --- TAB 1: APPLICATIONS --- */}
      {tabValue === 1 && (
        <Box>
          {applications.length === 0 && <Typography align="center" sx={{ mt: 4, color: 'gray' }}>No applications received yet.</Typography>}
          
          {applications.map(app => (
            <Paper key={app.id} elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, borderLeft: `5px solid ${app.status === 'Accepted' ? '#2e7d32' : app.status === 'Rejected' ? '#d32f2f' : '#ed6c02'}` }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary" sx={{fontWeight:'bold'}}>APPLICANT</Typography>
                  <Typography variant="h6">{app.applicant_name}</Typography>
                  <Chip label={app.status} size="small" color={app.status === 'Accepted' ? 'success' : app.status === 'Rejected' ? 'error' : 'warning'} sx={{ mt: 0.5 }} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary" sx={{fontWeight:'bold'}}>JOB</Typography>
                  <Typography variant="h6" color="#1565c0">{app.job_title}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }} sx={{ textAlign: 'right' }}>
                  <Button variant="outlined" startIcon={<DescriptionIcon />} onClick={() => setSelectedApp(app)}>View Resume</Button>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>
      )}

      {/* --- TAB 2: SEARCH CANDIDATES --- */}
      {tabValue === 2 && (
        <Box>
          <Paper elevation={1} sx={{ p: 2, mb: 4, display: 'flex', gap: 2, borderRadius: 2 }}>
            <TextField label="Search by Skill" variant="outlined" size="small" fullWidth value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Button variant="contained" onClick={() => fetchCandidates(searchTerm)} sx={{ px: 4, fontWeight: 'bold', bgcolor: '#1565c0' }}>Search</Button>
          </Paper>
          <Grid container spacing={3}>
            {candidates.map(resume => (
              <Grid size={{ xs: 12 }} key={resume.id}>
                <Card sx={{ borderRadius: 3, boxShadow: 2, display: 'flex', p: 2, alignItems: 'center' }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: '#1565c0', mr: 3 }}>{resume.full_name ? resume.full_name.charAt(0) : <PersonIcon />}</Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="bold">{resume.full_name || "Artisan"}</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>{resume.bio}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>{resume.skills && resume.skills.map(skill => <Chip key={skill.id} label={skill.name} size="small" variant="outlined" />)}</Box>
                  </Box>
                  <Button variant="outlined" size="small" onClick={() => handleViewCandidate(resume)}>View Profile</Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity="success" variant="filled" sx={{ width: '100%' }}>Job Posted Successfully!</Alert>
      </Snackbar>

      {/* --- RESUME MODAL --- */}
      {selectedApp && (
        <Dialog open={true} onClose={() => setSelectedApp(null)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" fontWeight="bold">{selectedApp.applicant_name}</Typography>
              <Box display="flex" alignItems="center" gap={1} sx={{ mt: 0.5 }}>
                <LocationOnIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">{selectedApp.applicant_location}</Typography>
              </Box>
            </Box>
            {selectedApp.quiz_score !== null && (
              <Box sx={{ textAlign: 'right', bgcolor: '#f1f8e9', p: 1, borderRadius: 2 }}>
                <Typography variant="caption" display="block" fontWeight="bold" color="#2e7d32">QUIZ SCORE</Typography>
                <Typography variant="h5" fontWeight="bold" color="#2e7d32">{selectedApp.quiz_score}%</Typography>
              </Box>
            )}
          </DialogTitle>
          
          <DialogContent sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">Bio</Typography>
            <Typography paragraph sx={{ whiteSpace: 'pre-wrap', color: '#444' }}>{selectedApp.applicant_bio}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom color="primary">Experience</Typography>
            <Typography paragraph sx={{ whiteSpace: 'pre-wrap', color: '#444' }}>{selectedApp.applicant_experience || "No experience listed."}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom color="primary">Education</Typography>
            <Typography paragraph sx={{ whiteSpace: 'pre-wrap', color: '#444' }}>{selectedApp.applicant_education || "No education listed."}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom color="primary">Skills</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>{selectedApp.applicant_skills && selectedApp.applicant_skills.map(skill => <Chip key={skill.id} label={skill.name} />)}</Box>

            {(selectedApp.status === 'Accepted' || selectedApp.status === 'Search View') && (
              <Box sx={{ bgcolor: '#f0fdf4', p: 3, borderRadius: 2, border: '1px solid #bbf7d0' }}>
                <Typography variant="subtitle1" color="success.main" fontWeight="bold" gutterBottom>Contact Info:</Typography>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Box display="flex" alignItems="center" gap={1}><EmailIcon color="action" /> <Typography variant="body1">{selectedApp.applicant_email}</Typography></Box>
                  <Box display="flex" alignItems="center" gap={1}><PhoneIcon color="action" /> <Typography variant="body1">{selectedApp.applicant_phone || "No Phone"}</Typography></Box>
                </Stack>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
            <Button onClick={() => setSelectedApp(null)}>Close</Button>
            {selectedApp.status === 'Pending' && (
              <>
                <Button variant="outlined" color="error" disabled={statusLoading} onClick={() => handleStatusChange('Rejected')}>Reject</Button>
                <Button variant="contained" color="success" disabled={statusLoading} onClick={() => handleStatusChange('Accepted')} startIcon={<CheckCircleIcon />}>Shortlist & View Contact</Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      )}

    </Container>
  );
}

export default EmployerDashboard;