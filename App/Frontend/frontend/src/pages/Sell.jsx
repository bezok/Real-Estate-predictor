import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';

export default function Sell() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [furnishing, setFurnishing] = useState('Unfurnished');
  const [bhk, setBhk] = useState(1);
  const [propertyType, setPropertyType] = useState('Flat');
  const [message, setMessage] = useState(null);
  const [severity, setSeverity] = useState('success');
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setMessage(null);
    try {
      const payload = { title, description, price, location, is_for_sale: true, furnishing, bhk, property_type: propertyType };
      const res = await api.post('/api/properties/create/', payload);
      setSeverity('success');

      // Show appended row if backend returned it
      if (res && res.appended_row) {
        setMessage(`Property listed successfully. Added to dataset: ${res.appended_row}`);
        console.log('Appended to CSV:', res.appended_row);
      } else {
        setMessage('Property listed successfully');
      }

      setTitle(''); setDescription(''); setPrice(''); setLocation(''); setFurnishing('Unfurnished'); setBhk(1); setPropertyType('Flat');

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

            <TextField select label="Furnishing" value={furnishing} onChange={e => setFurnishing(e.target.value)} fullWidth>
              <MenuItem value="Furnished">Furnished</MenuItem>
              <MenuItem value="Semi-Furnished">Semi-Furnished</MenuItem>
              <MenuItem value="Unfurnished">Unfurnished</MenuItem>
            </TextField>

            <TextField label="BHK" type="number" value={bhk} onChange={e=>setBhk(Number(e.target.value))} required fullWidth />

            <TextField select label="Property Type" value={propertyType} onChange={e => setPropertyType(e.target.value)} fullWidth>
              <MenuItem value="Flat">Flat</MenuItem>
              <MenuItem value="House">House</MenuItem>
              <MenuItem value="Villa">Villa</MenuItem>
            </TextField>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button type="submit" variant="contained">List Property</Button>
              <Button type="button" variant="outlined" onClick={() => { setTitle(''); setDescription(''); setPrice(''); setLocation(''); setFurnishing('Unfurnished'); setBhk(1); setPropertyType('Flat'); setMessage(null); }}>Reset</Button>
            </Box>

            {message && <Alert severity={severity}>{message}</Alert>}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
