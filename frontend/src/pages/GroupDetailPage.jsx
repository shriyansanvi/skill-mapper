import React, { useState, useEffect } from 'react';
import {
  Typography, Container, Box, CircularProgress, Alert, Paper,
  Button, Chip, Stack, Divider, Avatar, Snackbar
} from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import { api, useAuth } from '../context/AuthContext.jsx';
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import TopicRoundedIcon from '@mui/icons-material/TopicRounded';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';

function GroupDetailPage() {
  const { groupId } = useParams();
  const { token, isEmployer } = useAuth();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    api.get(`/api/groups/${groupId}/`)
      .then(({ data }) => { setGroup(data); setLoading(false); })
      .catch(() => { setError('Could not load group details.'); setLoading(false); });
  }, [groupId]);

  const handleJoin = () => {
    setJoinLoading(true);
    api.post(`/api/groups/${groupId}/join/`)
      .then(({ data }) => {
        setGroup(prev => ({
          ...prev,
          is_member: true,
          member_count: data.member_count ?? prev.member_count,
        }));
        setSnackbarMessage(data.message || 'Successfully joined the group!');
        setSnackbarOpen(true);
      })
      .catch((err) => {
        const msg = err?.response?.data?.error || 'Failed to join group. Please try again.';
        setSnackbarMessage(msg);
        setSnackbarOpen(true);
      })
      .finally(() => setJoinLoading(false));
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Alert severity="error">{error}</Alert>
      <Button component={Link} to="/explore" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>Back to Explore</Button>
    </Container>
  );

  if (!group) return null;

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 8 }}>
      <Box sx={{ bgcolor: '#0f172a', py: 6 }}>
        <Container maxWidth="md">
          <Button component={Link} to="/explore" startIcon={<ArrowBackIcon />} sx={{ color: '#94a3b8', mb: 3, textTransform: 'none' }}>
            Back to Explore
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#7c3aed', borderRadius: 3 }}>
              <Diversity3RoundedIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h3" fontWeight="800" color="white">{group.name}</Typography>
              <Chip label={group.topic} size="small" sx={{ mt: 1, bgcolor: 'rgba(124,58,237,0.2)', color: '#c4b5fd', border: '1px solid #7c3aed' }} />
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {[
              { icon: <PeopleRoundedIcon />, label: 'Members', value: group.member_count, color: '#7c3aed' },
              { icon: <PlaceRoundedIcon />, label: 'Location', value: group.location || 'Not specified', color: '#0ea5e9' },
              { icon: <TopicRoundedIcon />, label: 'Topic', value: group.topic, color: '#10b981' },
            ].map((stat) => (
              <Paper key={stat.label} elevation={0} sx={{ flex: 1, p: 3, borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: stat.color + '15', color: stat.color }}>
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">{stat.label.toUpperCase()}</Typography>
                  <Typography variant="body1" fontWeight="600">{stat.value}</Typography>
                </Box>
              </Paper>
            ))}
          </Stack>

          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" fontWeight="700" gutterBottom>About This Group</Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
              This self-help group brings together members focused on <strong>{group.topic}</strong>.
              With {group.member_count} active members{group.location ? ` in ${group.location}` : ''}, it's a great place to share resources, find opportunities, and grow together.
            </Typography>

            <Divider sx={{ my: 3 }} />

            {!token ? (
              <Alert severity="info">
                Please <Box component={Link} to="/login" sx={{ fontWeight: 700, color: 'inherit' }}>log in</Box> as a worker to join this group.
              </Alert>
            ) : isEmployer ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#f1f5f9', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <BusinessRoundedIcon sx={{ color: '#64748b' }} />
                <Typography color="text.secondary">
                  Self-Help Groups are for workers only. Employer accounts can browse but cannot join.
                </Typography>
              </Box>
            ) : group.is_member ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
                <CheckCircleIcon color="success" />
                <Typography color="success.main" fontWeight="600">You're a member of this group!</Typography>
              </Box>
            ) : (
              <Button
                variant="contained"
                size="large"
                onClick={handleJoin}
                disabled={joinLoading}
                sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' }, textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 4 }}
              >
                {joinLoading ? 'Joining...' : 'Join This Group'}
              </Button>
            )}
          </Paper>
        </Stack>
      </Container>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

export default GroupDetailPage;