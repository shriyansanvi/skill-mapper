import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Button, TextField, Box, Typography, Alert, CircularProgress, 
  Autocomplete, Chip, Stepper, Step, StepLabel, Paper, Grid 
} from '@mui/material';

const API_URL = 'http://127.0.0.1:8000';

const steps = ['Personal Information', 'Experience & Bio', 'Select Skills'];

// Pass token as a prop
function ResumeForm({ token, onResumeCreated }) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // --- Form Data State ---
  const [formData, setFormData] = useState({
    full_name: '',
    contact_email: '',
    contact_phone: '',
    location: '',
    experience: '',
    education: '',
    bio: '', // AI Generated Summary
    simpleBio: '', // Input for AI
  });

  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  // --- Fetch Skills on Load ---
  useEffect(() => {
    if (token) {
      axios.get(`${API_URL}/api/skills/`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => setAvailableSkills(res.data))
        .catch(err => console.error(err));
    }
  }, [token]);

  // --- Handle Text Change ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- AI Bio Generator ---
  const handleGenerateBio = () => {
    if (!formData.simpleBio) {
      setError("Please write a simple description first.");
      return;
    }
    setError('');
    setAiLoading(true);

    axios.post(`${API_URL}/api/generate-bio/`, 
      { text: formData.simpleBio }, 
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    .then(res => {
      setFormData({ ...formData, bio: res.data.bio });
      setAiLoading(false);
    })
    .catch(() => {
      setError("AI generation failed.");
      setAiLoading(false);
    });
  };

  // --- Submit Final Resume ---
  const handleSubmit = () => {
    setLoading(true);
    const skillIDs = selectedSkills.map(skill => skill.id);

    const payload = { ...formData, skills: skillIDs };

    axios.post(`${API_URL}/api/resumes/`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(() => {
      setLoading(false);
      onResumeCreated();
    })
    .catch(err => {
      console.error(err);
      setError("Failed to create profile.");
      setLoading(false);
    });
  };

  // --- Render Step Content ---
  const getStepContent = (step) => {
    switch (step) {
      case 0: // Personal Info
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Full Name" name="full_name" fullWidth value={formData.full_name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Location" name="location" fullWidth value={formData.location} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email" name="contact_email" fullWidth value={formData.contact_email} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Phone Number" name="contact_phone" fullWidth value={formData.contact_phone} onChange={handleChange} />
            </Grid>
          </Grid>
        );
      case 1: // Experience & Bio
        return (
          <Box>
            <TextField 
              label="Work Experience" 
              name="experience" 
              fullWidth multiline rows={3} 
              placeholder="e.g., Worked at local textile coop for 2 years..."
              value={formData.experience} 
              onChange={handleChange} 
              sx={{ mb: 2 }}
            />
            <TextField 
              label="Education" 
              name="education" 
              fullWidth multiline rows={2} 
              placeholder="e.g., High School Diploma, Govt Sewing Course..."
              value={formData.education} 
              onChange={handleChange} 
              sx={{ mb: 4 }}
            />
            
            <Typography variant="h6" gutterBottom>Professional Summary</Typography>
            <TextField 
              label="Describe yourself simply (for AI)" 
              name="simpleBio" 
              fullWidth multiline rows={2} 
              value={formData.simpleBio} 
              onChange={handleChange} 
              sx={{ mb: 1 }}
            />
            <Button variant="contained" color="secondary" onClick={handleGenerateBio} disabled={aiLoading} sx={{ mb: 2 }}>
              {aiLoading ? <CircularProgress size={20} /> : "Generate Professional Bio with AI"}
            </Button>
            <TextField 
              label="Final Bio" 
              name="bio" 
              fullWidth multiline rows={3} 
              value={formData.bio} 
              onChange={handleChange} 
            />
          </Box>
        );
      case 2: // Skills
        return (
          <Autocomplete
            multiple
            options={availableSkills}
            getOptionLabel={(option) => option.name}
            value={selectedSkills}
            onChange={(e, val) => setSelectedSkills(val)}
            renderInput={(params) => <TextField {...params} label="Select Your Skills" placeholder="Skills" />}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => <Chip label={option.name} {...getTagProps({ index })} />)
            }
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Resume Builder
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box>
        {getStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          {activeStep !== 0 && (
            <Button onClick={() => setActiveStep(activeStep - 1)} sx={{ mr: 1 }}>
              Back
            </Button>
          )}
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Create Resume'}
            </Button>
          ) : (
            <Button variant="contained" onClick={() => setActiveStep(activeStep + 1)}>
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default ResumeForm;