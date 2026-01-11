import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export default function Properties() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const nav = useNavigate();

  async function load() {
    try {
      const r = await api.get('/api/properties/');
      setList(r.results || []);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => { load(); }, []);

  async function search(e) {
    e.preventDefault();
    try {
      const r = await api.get(`/api/properties/search/?q=${encodeURIComponent(q)}`);
      setList(r.results || []);
    } catch (e) { console.error(e); }
  }

  return (
    <Box sx={{ maxWidth: 960, margin: '1rem auto' }}>
      <Typography variant="h5" gutterBottom>Properties for Sale</Typography>

      <Box component="form" onSubmit={search} sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField placeholder="Search by location or name" value={q} onChange={e=>setQ(e.target.value)} fullWidth />
        <Button type="submit" variant="contained">Search</Button>
        <Button type="button" onClick={load}>Refresh</Button>
      </Box>

      <Grid container spacing={2}>
        {list.length === 0 && <Grid item xs={12}><Typography>No properties available.</Typography></Grid>}
        {list.map(p => (
          <Grid item key={p.id} xs={12} sm={6} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">{p.title}</Typography>
                <Typography variant="body2" color="text.secondary">{p.location}</Typography>
                <Typography sx={{ mt: 1 }}>₹{p.price} Lakhs</Typography>
                <Button sx={{ mt: 2 }} variant="contained" onClick={() => nav(`/properties/${p.id}`)}>View Details</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
