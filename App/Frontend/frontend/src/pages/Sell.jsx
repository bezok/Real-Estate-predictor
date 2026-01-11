import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

export default function Sell() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState(null);
  const [severity, setSeverity] = useState('success');
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await api.post('/api/properties/create/', { title, description, price, location, is_for_sale: true });
      setSeverity('success');
      setMessage('Property listed successfully');
      setTitle(''); setDescription(''); setPrice(''); setLocation('');
      // If backend returned an id, navigate to the new property view
      if (res && res.id) nav(`/properties/${res.id}`);
    } catch (err) {
      setSeverity('error');
      setMessage(err.message || 'Failed to list property');
    }
  }

  return (
    <Box sx={{ maxWidth: 720, margin: '2rem auto' }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" gutterBottom>List Your Property</Typography>

          <Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2 }}>
            <TextField label="Title" value={title} onChange={e=>setTitle(e.target.value)} required fullWidth />
            <TextField label="Description" value={description} onChange={e=>setDescription(e.target.value)} multiline rows={4} fullWidth />
            <TextField label="Price (in Lakhs)" type="number" value={price} onChange={e=>setPrice(e.target.value)} required fullWidth />
            <TextField label="Location" value={location} onChange={e=>setLocation(e.target.value)} required fullWidth />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button type="submit" variant="contained">List Property</Button>
              <Button type="button" variant="outlined" onClick={() => { setTitle(''); setDescription(''); setPrice(''); setLocation(''); setMessage(null); }}>Reset</Button>
            </Box>

            {message && <Alert severity={severity}>{message}</Alert>}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
