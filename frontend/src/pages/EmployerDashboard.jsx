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
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import QuizIcon from '@mui/icons-material/Quiz';

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
  
  const [selectedApp, setSelectedApp] = useState(null); 
  const [statusLoading, setStatusLoading] = useState(false);

  // --- AI Quiz Generation State ---
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [quizJobTarget, setQuizJobTarget] = useState(null); // job object the quiz is being created for
  const [quizTopic, setQuizTopic] = useState('');
  const [quizGenerating, setQuizGenerating] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [jobsWithQuiz, setJobsWithQuiz] = useState({}); // { jobId: true } once a quiz exists
  
  const [searchTerm, setSearchTerm] = useState('');
  const [jobForm, setJobForm] = useState({
    title: '', company_name: '', location: '', job_type: 'Full-time', description: ''
  });

  const fetchMyJobs = () => {
    axios.get(`${API_URL}/api/jobs/?mine=true`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => {
        setMyJobs(res.data);
        // Check which of these jobs already have a quiz attached
        axios.get(`${API_URL}/api/quizzes/`, { headers: { 'Authorization': `Bearer ${token}` } })
          .then(quizRes => {
            const quizMap = {};
            quizRes.data.forEach(quiz => {
              if (quiz.job) quizMap[quiz.job] = true;
            });
            setJobsWithQuiz(quizMap);
          })
          .catch(err => console.error('Failed to fetch quizzes', err));
      })
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

  // --- AI Quiz Generation Handlers ---
  const openQuizDialog = (job) => {
    setQuizJobTarget(job);
    setQuizTopic('');
    setQuizError('');
    setQuizDialogOpen(true);
  };

  const closeQuizDialog = () => {
    setQuizDialogOpen(false);
    setQuizJobTarget(null);
    setQuizTopic('');
    setQuizError('');
  };

  const handleGenerateQuiz = () => {
    if (!quizTopic.trim()) {
      setQuizError('Please enter a topic for the quiz.');
      return;
    }
    setQuizGenerating(true);
    setQuizError('');

    axios.post(
      `${API_URL}/api/jobs/${quizJobTarget.id}/generate-quiz/`,
      { topic: quizTopic, num_questions: 5 },
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    .then((res) => {
      setQuizGenerating(false);
      setJobsWithQuiz(prev => ({ ...prev, [quizJobTarget.id]: true }));
      setSnackbarOpen(true);
      closeQuizDialog();
    })
    .catch((err) => {
      setQuizGenerating(false);
      const msg = err?.response?.data?.error || 'Failed to generate quiz. Please try again.';
      setQuizError(msg);
    });
  };

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
          
          {myJobs.length === 0 && (
            <Typography align="center" sx={{ mt: 4, color: 'gray' }}>You haven't posted any jobs yet.</Typography>
          )}

          {myJobs.map(job => (
            <Card key={job.id} sx={{ mb: 2, borderRadius: 2, boxShadow: 1, border: '1px solid #eee' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between"><Typography variant="h6" fontWeight="bold" color="#1565c0">{job.title}</Typography><Chip label={job.job_type} size="small" color="primary" variant="outlined" /></Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{job.company_name} • {job.location}</Typography>

                {jobsWithQuiz[job.id] ? (
                  <Chip
                    icon={<QuizIcon />}
                    label="Quiz Created"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AutoAwesomeIcon />}
                    onClick={() => openQuizDialog(job)}
                    sx={{
                      textTransform: 'none',
                      borderColor: '#7c3aed',
                      color: '#7c3aed',
                      '&:hover': { bgcolor: 'rgba(124,58,237,0.08)', borderColor: '#7c3aed' },
                    }}
                  >
                    Generate Quiz with AI
                  </Button>
                )}
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

      {/* --- TAB 2: SEARCH CANDIDATES (Fixed Card Layout) --- */}
      {tabValue === 2 && (
        <Box>
          <Paper elevation={1} sx={{ p: 2, mb: 4, display: 'flex', gap: 2, borderRadius: 2 }}>
            <TextField label="Search by Skill" variant="outlined" size="small" fullWidth value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Button variant="contained" onClick={() => fetchCandidates(searchTerm)} sx={{ px: 4, fontWeight: 'bold', bgcolor: '#1565c0' }}>Search</Button>
          </Paper>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
          ) : (
            <Stack spacing={2}>
              {candidates.length === 0 && (
                <Typography align="center" sx={{ mt: 4, color: 'gray' }}>No candidates found.</Typography>
              )}

              {candidates.map(resume => (
                <Card
                  key={resume.id}
                  sx={{
                    borderRadius: 3,
                    boxShadow: 2,
                    p: 3,
                    display: 'grid',
                    gridTemplateColumns: { xs: '56px 1fr', sm: '64px 1fr 140px' },
                    gridTemplateRows: { xs: 'auto auto', sm: 'auto' },
                    columnGap: 3,
                    rowGap: 1.5,
                    alignItems: 'center',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 56, height: 56,
                      bgcolor: '#1565c0',
                      fontSize: '1.5rem',
                      gridRow: { xs: '1 / 3', sm: '1' },
                    }}
                  >
                    {resume.full_name ? resume.full_name.charAt(0).toUpperCase() : <PersonIcon />}
                  </Avatar>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" fontWeight="bold" noWrap>
                      {resume.full_name || 'Artisan'}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {resume.bio || 'No bio provided yet.'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {resume.skills && resume.skills.length > 0 ? (
                        resume.skills.slice(0, 4).map(skill => (
                          <Chip key={skill.id} label={skill.name} size="small" variant="outlined" />
                        ))
                      ) : (
                        <Chip label="No skills listed" size="small" variant="outlined" sx={{ color: 'text.disabled' }} />
                      )}
                      {resume.skills && resume.skills.length > 4 && (
                        <Chip label={`+${resume.skills.length - 4}`} size="small" sx={{ bgcolor: '#f1f5f9' }} />
                      )}
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleViewCandidate(resume)}
                    sx={{
                      gridColumn: { xs: '2', sm: '3' },
                      justifySelf: { xs: 'start', sm: 'end' },
                      whiteSpace: 'nowrap',
                      minWidth: 120,
                    }}
                  >
                    View Profile
                  </Button>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      )}

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity="success" variant="filled" sx={{ width: '100%' }}>
          {postSuccess ? 'Job Posted Successfully!' : 'Quiz Generated Successfully!'}
        </Alert>
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

      {/* --- AI QUIZ GENERATION DIALOG --- */}
      <Dialog open={quizDialogOpen} onClose={closeQuizDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AutoAwesomeIcon sx={{ color: '#7c3aed' }} />
          Generate Quiz with AI
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Creating a skill assessment for: <strong>{quizJobTarget?.title}</strong>
          </Typography>

          {quizError && <Alert severity="error" sx={{ mb: 2 }}>{quizError}</Alert>}

          <TextField
            label="What topic should the quiz cover?"
            placeholder="e.g. hand embroidery techniques, bamboo weaving, tailoring basics"
            fullWidth
            multiline
            rows={2}
            value={quizTopic}
            onChange={(e) => setQuizTopic(e.target.value)}
            disabled={quizGenerating}
            autoFocus
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            AI will generate 5 multiple-choice questions on this topic, tailored to the job.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={closeQuizDialog} disabled={quizGenerating}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleGenerateQuiz}
            disabled={quizGenerating}
            startIcon={quizGenerating ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
            sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' } }}
          >
            {quizGenerating ? 'Generating...' : 'Generate Quiz'}
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}

export default EmployerDashboard;