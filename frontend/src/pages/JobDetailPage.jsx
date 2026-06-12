import React, { useState, useEffect } from 'react';
import { Typography, Container, Box, CircularProgress, Alert, Paper, Button, Chip } from '@mui/material';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import WorkIcon from '@mui/icons-material/Work';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = 'http://127.0.0.1:8000';

const getJobTypeColor = (jobType) => {
  switch (jobType) {
    case 'Full-time': return 'success';
    case 'Part-time': return 'warning';
    case 'Contract': return 'info';
    default: return 'default';
  }
};

function JobDetailPage() {
  const { jobId } = useParams();
  const { token, isEmployer } = useAuth();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [linkedQuiz, setLinkedQuiz] = useState(null); // Store quiz info

  useEffect(() => {
    const fetchJobAndQuiz = async () => {
      setLoading(true);
      try {
        // 1. Fetch Job
        const jobRes = await axios.get(`${API_URL}/api/jobs/${jobId}/`);
        setJob(jobRes.data);

        // 2. Check if there is a quiz linked to this job
        // We filter quizzes by this job ID
        if (token) {
            const quizRes = await axios.get(`${API_URL}/api/quizzes/?job=${jobId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (quizRes.data.length > 0) {
                setLinkedQuiz(quizRes.data[0]); // Get the first linked quiz
            }
        }
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError("Could not load job details.");
        setLoading(false);
      }
    };

    fetchJobAndQuiz();
  }, [jobId, token]);

  const handleDirectApply = () => {
    // If no quiz, just apply directly
    axios.post(`${API_URL}/api/applications/`, 
        { job: job.id, quiz_score: 0 },
        { headers: { 'Authorization': `Bearer ${token}` } }
    ).then(() => alert("Application Sent!"))
     .catch(() => alert("Failed to apply."));
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!job) return <Typography>Job not found.</Typography>;

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, boxShadow: 3, borderRadius: 2, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <WorkIcon color="action" sx={{ fontSize: 40 }} />
          <Chip label={job.job_type} color={getJobTypeColor(job.job_type)} />
        </Box>
        
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {job.title}
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {job.company_name} - {job.location}
        </Typography>
        
        <Typography variant="body1" sx={{ mt: 3, mb: 3 }}>
          {job.description || 'No description provided.'}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Required Skills:</Typography>
          {job.required_skills && job.required_skills.length > 0 ? (
            job.required_skills.map(skill => (
              <Chip key={skill.id} label={skill.name} sx={{ mr: 1, mb: 1 }} />
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">No specific skills listed.</Typography>
          )}
        </Box>
        
        {/* --- APPLY LOGIC --- */}
        {!isEmployer && (
            <Box sx={{ mt: 4 }}>
                {linkedQuiz ? (
                    <>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            This job requires a skills assessment.
                        </Alert>
                        <Button 
                            component={Link} 
                            // We pass the job ID in the state so the Quiz page knows what we are applying for
                            to={`/quizzes/${linkedQuiz.id}`} 
                            state={{ applyingForJobId: job.id }}
                            variant="contained" 
                            size="large" 
                            fullWidth
                        >
                            Take Quiz to Apply
                        </Button>
                    </>
                ) : (
                    <Button variant="contained" size="large" fullWidth onClick={handleDirectApply}>
                        Apply Now
                    </Button>
                )}
            </Box>
        )}

      </Paper>
    </Container>
  );
}

export default JobDetailPage;