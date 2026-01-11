import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

export default function PropertyView() {
  const { id } = useParams();
  const nav = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get(`/api/properties/${id}/`)
      .then(res => { if (mounted) setProperty(res); })
      .catch(err => { if (mounted) setError(err.message || 'Failed to load'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <Box sx={{ maxWidth: 720, mx: 'auto', mt: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ maxWidth: 720, mx: 'auto', mt: 4 }}><Typography color="error">{error}</Typography></Box>;
  if (!property) return <Box sx={{ maxWidth: 720, mx: 'auto', mt: 4 }}><Typography>No property found.</Typography></Box>;

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', mt: 4 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h4">{property.title}</Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>{property.location}</Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>₹{property.price} Lakhs</Typography>

          <Typography sx={{ mt: 2 }}>{property.description}</Typography>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={() => nav('/details', { state: { property } })}>Predict for this property</Button>
            <Button variant="outlined" onClick={() => nav('/properties')}>Back to list</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}