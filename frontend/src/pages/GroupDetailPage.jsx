import React, { useState, useEffect } from 'react';
import { Typography, Container, Box, CircularProgress, Alert, Paper, Button } from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import GroupIcon from '@mui/icons-material/Group';

const API_URL = 'http://127.0.0.1:8000';

function GroupDetailPage() {
  const { groupId } = useParams(); // Gets the '1' from the URL
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroup = () => {
      setLoading(true);
      setError('');

      axios.get(`${API_URL}/api/groups/${groupId}/`)
        .then(response => {
          setGroup(response.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch group details:", err);
          setError("Could not load group details.");
          setLoading(false);
        });
    };

    fetchGroup();
  }, [groupId]); // Refetch if the groupId in the URL changes

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

  if (!group) {
    return <Typography>Group not found.</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, boxShadow: 3, borderRadius: 2 }}>
        <GroupIcon color="secondary" sx={{ fontSize: 40, mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {group.name}
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Topic: {group.topic}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          <strong>Location:</strong> {group.location || 'Not specified'}
        </Typography>
        <Typography variant="body1">
          <strong>Members:</strong> {group.member_count}
        </Typography>
        
        <Button variant="contained" size="large" sx={{ mt: 4 }}>
          Join This Group
        </Button>
      </Paper>
      
      <Button component={Link} to="/" sx={{ mt: 2 }}>
        &larr; Back to Homepage
      </Button>
    </Container>
  );
}

export default GroupDetailPage;