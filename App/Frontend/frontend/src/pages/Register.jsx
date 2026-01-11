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

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  const { register } = useContext(AuthContext);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await register(username, email, password);
      nav('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  }

  return (
    <Box sx={{ maxWidth: 480, margin: '2rem auto' }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" gutterBottom>Create account</Typography>

          <Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2 }}>
            <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} required fullWidth />
            <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth />
            <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required fullWidth />
            <TextField label="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required fullWidth />

            {error && <Alert severity="error">{error}</Alert>}

            <Button type="submit" variant="contained" fullWidth>Create Account</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
