import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Grid, Card, CardContent, Button, 
  Box, CircularProgress, Alert, Chip 
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import QuizIcon from '@mui/icons-material/Quiz';

const API_URL = 'http://127.0.0.1:8000';

function QuizListPage() {
  const { token } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/api/quizzes/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      setQuizzes(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setError("Failed to load assessments.");
      setLoading(false);
    });
  }, [token]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" fontWeight="800" color="#1e293b" gutterBottom>
          Skill Assessments
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
          Prove your skills to employers by taking these mock tests.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {quizzes.length === 0 && (
          <Grid item xs={12} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">No assessments available at the moment.</Typography>
          </Grid>
        )}
        
        {quizzes.map((quiz) => (
          <Grid item xs={12} sm={6} md={4} key={quiz.id}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                transition: '0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', borderColor: '#1976d2' }
              }}
            >
              <CardContent sx={{ p: 3, flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: '#e0f2fe', borderRadius: 2, color: '#0284c7' }}>
                    <QuizIcon />
                  </Box>
                  <Chip label="Assessment" size="small" color="primary" variant="outlined" />
                </Box>
                
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {quiz.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {quiz.description || "Take this test to verify your skills."}
                </Typography>
              </CardContent>

              <Box sx={{ p: 3, pt: 0 }}>
                <Button 
                  component={Link} 
                  to={`/quizzes/${quiz.id}`} 
                  variant="contained" 
                  fullWidth
                  size="large"
                  sx={{ bgcolor: '#0f172a', fontWeight: 'bold', '&:hover': { bgcolor: '#334155' } }}
                >
                  Start Test
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default QuizListPage;