import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useLocation } from 'react-router-dom';
import { 
  Container, Typography, Box, Button, Card, CardContent, Radio, 
  RadioGroup, FormControlLabel, FormControl, CircularProgress, Alert, Paper, Divider 
} from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const API_URL = 'http://127.0.0.1:8000';

function TakeQuizPage() {
  const { quizId } = useParams();
  const { token } = useAuth();
  const location = useLocation(); // To get the job ID if passed

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState('');

  // Check if we are applying for a job (passed from JobDetailPage)
  const applyingForJobId = location.state?.applyingForJobId;

  // 1. Fetch Quiz Data
  useEffect(() => {
    axios.get(`${API_URL}/api/quizzes/${quizId}/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      setQuiz(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [quizId, token]);

  // 2. Handle Answer Selection
  const handleOptionChange = (questionId, choiceId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: choiceId
    }));
  };

  // 3. Submit Logic
  const handleSubmit = () => {
    setSubmitting(true);
    
    // Step A: Score the Quiz
    axios.post(`${API_URL}/api/quizzes/${quizId}/submit/`, answers, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      const score = res.data.score;
      setResult(res.data);

      // Step B: If applying for a job, submit the application automatically
      if (applyingForJobId) {
        submitJobApplication(score);
      } else {
        setSubmitting(false);
      }
    })
    .catch(err => {
      console.error(err);
      alert("Failed to submit quiz.");
      setSubmitting(false);
    });
  };

  // 4. Job Application Logic
  const submitJobApplication = (score) => {
    axios.post(`${API_URL}/api/applications/`, 
        { job: applyingForJobId, quiz_score: score },
        { headers: { 'Authorization': `Bearer ${token}` } }
    )
    .then(() => {
        setApplicationStatus("Application submitted successfully!");
        setSubmitting(false);
    })
    .catch(err => {
        console.error(err);
        setApplicationStatus("Quiz passed, but application failed (maybe already applied?)");
        setSubmitting(false);
    });
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (!quiz) return <Container sx={{ mt: 8 }}><Alert severity="error">Quiz not found.</Alert></Container>;

  // --- RESULT VIEW ---
  if (result) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 5, borderRadius: 4 }}>
          {result.passed ? (
            <CheckCircleIcon sx={{ fontSize: 80, color: '#2e7d32', mb: 2 }} />
          ) : (
            <CancelIcon sx={{ fontSize: 80, color: '#d32f2f', mb: 2 }} />
          )}
          
          <Typography variant="h3" fontWeight="bold" gutterBottom color={result.passed ? '#2e7d32' : '#d32f2f'}>
            {result.score}%
          </Typography>
          
          <Typography variant="h5" gutterBottom fontWeight="bold">
            {result.passed ? "Assessment Passed!" : "Not quite there yet."}
          </Typography>
          
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            You answered {result.correct_answers} out of {result.total_questions} questions correctly.
          </Typography>

          {/* Application Status Message */}
          {applyingForJobId && (
            <Alert severity={applicationStatus.includes("failed") ? "warning" : "success"} sx={{ mb: 3 }}>
              {applicationStatus}
            </Alert>
          )}

          <Button component={Link} to="/dashboard" variant="contained" size="large" sx={{ bgcolor: '#1976d2' }}>
            Go to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  // --- QUIZ FORM VIEW ---
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      {applyingForJobId && (
        <Alert severity="info" sx={{ mb: 3 }}>
            You are taking this assessment to apply for a job. Good luck!
        </Alert>
      )}
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" color="primary" fontWeight="bold">SKILL ASSESSMENT</Typography>
        <Typography variant="h4" fontWeight="bold" gutterBottom>{quiz.title}</Typography>
        <Typography variant="body1" color="text.secondary">{quiz.description}</Typography>
      </Box>

      {quiz.questions.map((q, index) => (
        <Card key={q.id} sx={{ mb: 3, borderRadius: 2, boxShadow: 1, border: '1px solid #e2e8f0' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              {index + 1}. {q.text}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <FormControl component="fieldset">
              <RadioGroup
                name={`question-${q.id}`}
                value={answers[q.id] || ''}
                onChange={(e) => handleOptionChange(q.id, e.target.value)}
              >
                {q.choices.map((choice) => (
                  <FormControlLabel 
                    key={choice.id} 
                    value={choice.id} 
                    control={<Radio />} 
                    label={choice.text} 
                    sx={{ mb: 1 }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button 
          variant="contained" 
          size="large" 
          onClick={handleSubmit}
          disabled={submitting}
          sx={{ px: 5, py: 1.5, fontWeight: 'bold', bgcolor: '#0284c7' }}
        >
          {submitting ? <CircularProgress size={24} color="inherit" /> : "Submit Answers"}
        </Button>
      </Box>
    </Container>
  );
}

export default TakeQuizPage;