import React, { useState, useEffect } from 'react';
import { Typography, Container, Box, CircularProgress, Alert, Paper, Button, Chip } from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import WorkIcon from '@mui/icons-material/Work';

const API_URL = 'http://127.0.0.1:8000';

// --- Job Type Color Helper ---
const getJobTypeColor = (jobType) => {
  switch (jobType) {
    case 'Full-time': return 'success';
    case 'Part-time': return 'warning';
    case 'Contract': return 'info';
    default: return 'default';
  }
};

function JobDetailPage() {
  const { jobId } = useParams(); // Gets the '1' from the URL
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = () => {
      setLoading(true);
      setError('');

      // Use the API endpoint for a single job
      axios.get(`${API_URL}/api/jobs/${jobId}/`)
        .then(response => {
          setJob(response.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch job details:", err);
          setError("Could not load job details.");
          setLoading(false);
        });
    };

    fetchJob();
  }, [jobId]); // Refetch if the jobId in the URL changes

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!job) {
    return <Typography>Job not found.</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <WorkIcon color="action" sx={{ fontSize: 40 }} />
          <Chip 
            label={job.job_type} 
            color={getJobTypeColor(job.job_type)} 
          />
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
        
        <Button variant="contained" size="large" sx={{ mt: 2 }}>
          Apply Now
        </Button>
      </Paper>
      
      <Button component={Link} to="/" sx={{ mt: 2 }}>
        &larr; Back to Homepage
      </Button>
    </Container>
  );
}

export default JobDetailPage;