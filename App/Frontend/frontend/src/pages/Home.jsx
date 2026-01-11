import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { keyframes } from '@emotion/react';
import { AuthContext } from '../contexts/AuthContext';

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0); }
`;

export default function Home() {
  const { user } = useContext(AuthContext);
  const nav = useNavigate();

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function requireLoginOr(fn) {
    return () => {
      if (!user) return nav('/login');
      return fn();
    };
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero with animated gradient background and placeholder image */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: -1,
          backgroundImage: 'linear-gradient(120deg, rgba(2,6,23,0.9), rgba(9,30,63,0.85)), url(/path/to/your-hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(255,140,0,0.06), rgba(99,102,241,0.06), rgba(16,185,129,0.06))',
            backgroundSize: '400% 400%',
            animation: `${gradientShift} 12s ease infinite`,
          },
        }}
      />

      <Container sx={{ position: 'relative', zIndex: 1, pt: 8, pb: 6 }}>
        <Grid container alignItems="center" spacing={4}>
          <Grid item xs={12} md={7}>
            <Typography variant="h2" component="h1" sx={{ color: 'common.white', fontWeight: 800, mb: 2, textShadow: '0 4px 18px rgba(2,6,23,0.6)' }}>
              Find the perfect property or predict its value instantly
            </Typography>

            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mb: 3 }}>
              Fast, reliable predictions powered by your data. Use the tools to explore, list, and estimate property prices with confidence.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" color="primary" size="large" onClick={requireLoginOr(() => scrollToSection('features'))}>Explore Properties</Button>
              <Button variant="outlined" color="inherit" size="large" onClick={requireLoginOr(() => scrollToSection('features'))}>Get a Prediction</Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            {/* Floating card placeholder for preview or promotional content */}
            <Paper elevation={8} sx={{ p: 3, borderRadius: 2, animation: `${float} 6s ease-in-out infinite`, backgroundColor: 'rgba(255,255,255,0.95)' }}>
              <Typography variant="subtitle2" color="text.secondary">Featured</Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>Premium predictive insights</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try our real-time prediction engine — change details and see results immediately.
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button size="small" onClick={requireLoginOr(() => scrollToSection('features'))}>List a property</Button>
                <Button size="small" variant="contained" onClick={requireLoginOr(() => scrollToSection('features'))}>Predict now</Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Features row with subtle animations */}
      <Container id="features" sx={{ position: 'relative', zIndex: 1, pb: 8 }}>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2, '&:hover': { transform: 'translateY(-6px)', transition: 'transform 300ms' } }}>
              <Typography variant="h6">Live predictions</Typography>
              <Typography variant="body2" color="text.secondary">See predictions update as you change property details.</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2, '&:hover': { transform: 'translateY(-6px)', transition: 'transform 300ms' } }}>
              <Typography variant="h6">List with ease</Typography>
              <Typography variant="body2" color="text.secondary">Create property listings and manage them from your dashboard.</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2, '&:hover': { transform: 'translateY(-6px)', transition: 'transform 300ms' } }}>
              <Typography variant="h6">Explore markets</Typography>
              <Typography variant="body2" color="text.secondary">Browse properties across cities and filter by your preferences.</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Additional content to make the page scrollable */}
        <Grid container spacing={4} sx={{ mt: 6 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5">How it works</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Enter property details on the right, and the prediction will update automatically. You can also list a property to make it available for others.
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h5">Testimonials</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              "Great tool — helped me price my apartment accurately." — User A
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              "Fast and reliable predictions." — User B
            </Typography>
          </Grid>
        </Grid>

        
        
      </Container>
    </Box>
  );
}
