import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Button, Box, Typography, Alert, CircularProgress, Chip, TextField, 
  Grid, Card, CardMedia, CardContent, Avatar, Divider, Paper, Stack, Container
} from '@mui/material';
import ResumeForm from '../components/ResumeForm.jsx';
import UploadIcon from '@mui/icons-material/Upload'; 
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import VerifiedIcon from '@mui/icons-material/Verified';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const API_URL = 'http://127.0.0.1:8000';

function WomanDashboard() {
  const { token } = useAuth();
  const [resume, setResume] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // --- Portfolio State ---
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  // --- Edit Mode State ---
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    contact_email: '',
    contact_phone: '',
    location: '',
    bio: '',
    experience: '',
    education: ''
  });
  const [aiLoading, setAiLoading] = useState(false);

  // --- Temporary State for Builders ---
  const [experienceList, setExperienceList] = useState([]);
  const [educationList, setEducationList] = useState([]);

  // --- Fetch Data ---
  const fetchData = () => {
    setError('');
    setLoading(true);

    const resumeRequest = axios.get(`${API_URL}/api/resumes/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const portfolioRequest = axios.get(`${API_URL}/api/portfolio/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    Promise.all([resumeRequest, portfolioRequest])
      .then(([resumeResponse, portfolioResponse]) => {
        if (resumeResponse.data && resumeResponse.data.length > 0) {
          const data = resumeResponse.data[0];
          setResume(data);
          setFormData({
            full_name: data.full_name || '',
            contact_email: data.contact_email || '',
            contact_phone: data.contact_phone || '',
            location: data.location || '',
            bio: data.bio || '',
            experience: data.experience || '',
            education: data.education || ''
          });
        } else {
          setResume(null); 
        }
        setPortfolioImages(portfolioResponse.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Fetch error!", error);
        setError("Failed to fetch profile.");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // --- Handle Input Change ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Experience Builder Logic ---
  const addExperience = () => {
    setExperienceList([...experienceList, { role: '', company: '', years: '' }]);
  };
  const removeExperience = (index) => {
    const newList = [...experienceList];
    newList.splice(index, 1);
    setExperienceList(newList);
    updateExperienceString(newList);
  };
  const updateExperience = (index, field, value) => {
    const newList = [...experienceList];
    newList[index][field] = value;
    setExperienceList(newList);
    updateExperienceString(newList);
  };
  const updateExperienceString = (list) => {
    const text = list.map(item => `• ${item.role} at ${item.company} (${item.years})`).join('\n');
    setFormData(prev => ({ ...prev, experience: text }));
  };

  // --- Education Builder Logic ---
  const addEducation = () => {
    setEducationList([...educationList, { degree: '', school: '', year: '' }]);
  };
  const removeEducation = (index) => {
    const newList = [...educationList];
    newList.splice(index, 1);
    setEducationList(newList);
    updateEducationString(newList);
  };
  const updateEducation = (index, field, value) => {
    const newList = [...educationList];
    newList[index][field] = value;
    setEducationList(newList);
    updateEducationString(newList);
  };
  const updateEducationString = (list) => {
    const text = list.map(item => `• ${item.degree}, ${item.school} (${item.year})`).join('\n');
    setFormData(prev => ({ ...prev, education: text }));
  };

  // --- AI Bio Generator ---
  const handleGenerateBio = () => {
    if (!formData.bio) {
      setError("Please write something in your bio to improve.");
      return;
    }
    setError('');
    setAiLoading(true);

    axios.post(`${API_URL}/api/generate-bio/`, 
      { text: formData.bio }, 
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    .then(response => {
      setFormData(prev => ({ ...prev, bio: response.data.bio }));
      setAiLoading(false);
    })
    .catch(error => {
      setError("Failed to generate bio with AI.");
      setAiLoading(false);
    });
  };

  // --- Save Changes ---
  const handleSaveChanges = () => {
    setLoading(true);
    setError('');

    const skillIDs = resume.skills.map(skill => skill.id);

    axios.put(`${API_URL}/api/resumes/${resume.id}/`, 
      { ...formData, skills: skillIDs },
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    .then(response => {
      setResume(response.data); 
      setLoading(false);
      setIsEditing(false); 
    })
    .catch(error => {
      console.error("Save error!", error);
      setError("Failed to save profile.");
      setLoading(false);
    });
  };

  // --- Image Upload Handler ---
  const handleImageUpload = (e) => {
    e.preventDefault();
    if (!imageFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('caption', caption);

    axios.post(`${API_URL}/api/portfolio/`, formData, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
    })
    .then(() => {
      setUploading(false);
      setCaption(''); setImageFile(null);
      fetchData(); 
    })
    .catch(() => {
      setUploading(false);
      setError("Failed to upload image.");
    });
  };

  // --- RENDER ---

  if (loading && !isEditing) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error} <Button onClick={fetchData}>Try again</Button></Alert>;
  
  if (!resume) return <ResumeForm token={token} onResumeCreated={fetchData} />;

  return (
    // FIX: Changed maxWidth to "md" (Medium) to prevent stretching
    <Container maxWidth="md" sx={{ pb: 8 }}>
      
      {/* --- HEADER --- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          My Dashboard
        </Typography>
        {!isEditing && (
          <Button variant="outlined" onClick={() => setIsEditing(true)}>
            Edit Resume
          </Button>
        )}
      </Box>

      {/* --- RESUME CARD --- */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 5 }}>
        {!isEditing ? (
          // --- VIEW MODE ---
          <Grid container spacing={4}>
            {/* Left Column: Contact & Avatar */}
            <Grid item xs={12} sm={4} sx={{ borderRight: { sm: '1px solid #eee' }, textAlign: { xs: 'center', sm: 'left' } }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar sx={{ width: 100, height: 100, margin: '0 auto', bgcolor: '#1976d2', fontSize: 40 }}>
                  {resume.full_name ? resume.full_name.charAt(0) : <PersonIcon />}
                </Avatar>
                <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
                  {resume.full_name || "Your Name"}
                </Typography>
                {resume.is_verified && <Chip icon={<VerifiedIcon />} label="Verified" color="success" size="small" sx={{ mt: 1 }} />}
              </Box>
              
              <Stack spacing={2} sx={{ alignItems: { xs: 'center', sm: 'flex-start' } }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOnIcon color="action" /> 
                  <Typography variant="body2">{resume.location}</Typography>
                </Box>
                {resume.contact_email && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <EmailIcon color="action" /> 
                    <Typography variant="body2">{resume.contact_email}</Typography>
                  </Box>
                )}
                {resume.contact_phone && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <PhoneIcon color="action" /> 
                    <Typography variant="body2">{resume.contact_phone}</Typography>
                  </Box>
                )}
              </Stack>

              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom align="center">Skills</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {resume.skills && resume.skills.map(skill => (
                  <Chip key={skill.id} label={skill.name} />
                ))}
              </Box>
            </Grid>

            {/* Right Column: Details */}
            <Grid item xs={12} sm={8}>
              <Typography variant="h6" sx={{ color: '#1976d2', mb: 1 }}>PROFESSIONAL SUMMARY</Typography>
              <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                {resume.bio}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ color: '#1976d2', mb: 1 }}>EXPERIENCE</Typography>
              <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                {resume.experience || "No experience added yet."}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ color: '#1976d2', mb: 1 }}>EDUCATION</Typography>
              <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                {resume.education || "No education details added yet."}
              </Typography>
            </Grid>
          </Grid>
        ) : (
          // --- EDIT MODE ---
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>Edit Your Resume</Typography>
            
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <TextField label="Full Name" name="full_name" fullWidth value={formData.full_name} onChange={handleChange} margin="normal" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Location" name="location" fullWidth value={formData.location} onChange={handleChange} margin="normal" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Email" name="contact_email" fullWidth value={formData.contact_email} onChange={handleChange} margin="normal" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Phone" name="contact_phone" fullWidth value={formData.contact_phone} onChange={handleChange} margin="normal" />
              </Grid>
            </Grid>

            {/* Bio */}
            <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>Professional Bio</Typography>
            <TextField 
              fullWidth multiline rows={3} name="bio" value={formData.bio} onChange={handleChange} margin="normal" 
              helperText="Use AI to rewrite this professionally."
            />
            <Button variant="contained" color="secondary" onClick={handleGenerateBio} disabled={aiLoading} sx={{ mb: 4 }}>
              {aiLoading ? <CircularProgress size={20} /> : "Improve with AI"}
            </Button>

            {/* Experience Builder */}
            <Box sx={{ mb: 4, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ color: '#1976d2' }}>Experience</Typography>
                <Button startIcon={<AddCircleOutlineIcon />} onClick={addExperience}>Add Job</Button>
              </Box>
              {experienceList.map((exp, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField label="Job Role" fullWidth size="small" value={exp.role} onChange={(e) => updateExperience(index, 'role', e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField label="Company" fullWidth size="small" value={exp.company} onChange={(e) => updateExperience(index, 'company', e.target.value)} />
                  </Grid>
                  <Grid item xs={10} sm={3}>
                    <TextField label="Years" fullWidth size="small" value={exp.years} onChange={(e) => updateExperience(index, 'years', e.target.value)} />
                  </Grid>
                  <Grid item xs={2} sm={1}>
                    <IconButton color="error" onClick={() => removeExperience(index)}><DeleteOutlineIcon /></IconButton>
                  </Grid>
                </Grid>
              ))}
              <TextField label="Generated Experience Text (Editable)" name="experience" fullWidth multiline rows={3} value={formData.experience} onChange={handleChange} />
            </Box>

            {/* Education Builder */}
            <Box sx={{ mb: 4, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ color: '#1976d2' }}>Education</Typography>
                <Button startIcon={<AddCircleOutlineIcon />} onClick={addEducation}>Add School</Button>
              </Box>
              {educationList.map((edu, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField label="Degree" fullWidth size="small" value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField label="School" fullWidth size="small" value={edu.school} onChange={(e) => updateEducation(index, 'school', e.target.value)} />
                  </Grid>
                  <Grid item xs={10} sm={3}>
                    <TextField label="Year" fullWidth size="small" value={edu.year} onChange={(e) => updateEducation(index, 'year', e.target.value)} />
                  </Grid>
                  <Grid item xs={2} sm={1}>
                    <IconButton color="error" onClick={() => removeEducation(index)}><DeleteOutlineIcon /></IconButton>
                  </Grid>
                </Grid>
              ))}
              <TextField label="Generated Education Text (Editable)" name="education" fullWidth multiline rows={2} value={formData.education} onChange={handleChange} />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
              <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleSaveChanges} disabled={loading}>Save Changes</Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* --- PORTFOLIO SECTION --- */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mt: 6, mb: 3 }}>
        Showcase Your Skills
      </Typography>
      
      {/* FIX 2: Stacked Upload Form */}
      <Paper elevation={1} sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Upload New Work</Typography>
        <Box component="form" onSubmit={handleImageUpload} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button variant="outlined" component="label" startIcon={<UploadIcon />} sx={{ alignSelf: 'flex-start' }}>
            Choose Image File
            <input type="file" hidden onChange={(e) => setImageFile(e.target.files[0])} />
          </Button>
          {imageFile && <Typography variant="body2" sx={{ color: 'green' }}>Selected: {imageFile.name}</Typography>}
          <TextField label="Caption (e.g., 'Handwoven silk scarf')" variant="outlined" size="small" fullWidth value={caption} onChange={(e) => setCaption(e.target.value)} />
          <Button type="submit" variant="contained" disabled={uploading} sx={{ alignSelf: 'flex-start', minWidth: 120 }}>
            {uploading ? <CircularProgress size={24} color="inherit" /> : 'Upload Photo'}
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {portfolioImages.length === 0 ? (
          <Grid item xs={12}><Typography color="textSecondary" align="center" sx={{ py: 4 }}>You haven't uploaded any photos yet.</Typography></Grid>
        ) : (
          portfolioImages.map((image) => (
            <Grid item xs={12} sm={6} md={4} key={image.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 2 }}>
                <CardMedia component="img" height="250" image={image.image} alt={image.caption} sx={{ objectFit: 'cover' }} />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" fontWeight="medium">{image.caption}</Typography>
                  <Typography variant="caption" color="textSecondary">Uploaded on {new Date(image.uploaded_at).toLocaleDateString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}

export default WomanDashboard;