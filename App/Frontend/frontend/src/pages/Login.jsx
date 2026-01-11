import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError(null);
    try {
      await login(username, password);
      nav('/properties');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  }

  return (
    <Box sx={{ maxWidth: 480, margin: '2rem auto' }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" gutterBottom>Sign in</Typography>

          <Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2 }}>
            <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} required fullWidth />
            <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required fullWidth />

            {error && <Alert severity="error">{error}</Alert>}

            <Button type="submit" variant="contained" fullWidth>Sign In</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
