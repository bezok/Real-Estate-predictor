import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';

// Material UI imports
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

export default function Details() {
  const nav = useNavigate();
  const locationState = useLocation();
  const property = locationState.state?.property;

  const [city, setCity] = useState(property?.location || '');
  const [cities, setCities] = useState([]);
  const [cityTouched, setCityTouched] = useState(false);
  const [bhk, setBhk] = useState(1);
  const [furnishing, setFurnishing] = useState('Furnished');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [error, setError] = useState(null);

  const [predicted, setPredicted] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    // load cached cities first
    try {
      const cached = localStorage.getItem('cities');
      if (cached) setCities(JSON.parse(cached));
    } catch(e) { /* ignore */ }

    // fetch latest list
    let mounted = true;
    api.get('/api/cities/')
      .then(res => {
        const list = res?.cities || [];
        if (mounted && list.length) {
          setCities(list);
          localStorage.setItem('cities', JSON.stringify(list));
        }
      })
      .catch(() => {/* ignore network errors */});

    return () => { mounted = false; };
  }, []);

  // if no city selected, pick the first available when cities load
  useEffect(() => {
    if (!city && cities.length && !cityTouched) {
      setCity(property?.location || cities[0]);
    }
  }, [cities, property, city, cityTouched]);

  // Debounced predictive call on input change
  useEffect(() => {
    // Clear previous debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Don't attempt prediction until city is set
    if (!city) return;

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      setError(null);
      try {
        const res = await api.post('/api/predict/', { bhk, furnishing, property_type: propertyType, city });
        setPredicted(res.predicted_price);
      } catch (err) {
        setError(err.message || 'Prediction failed');
        setPredicted(null);
      } finally {
        setLoading(false);
      }
    }, 450); // 450ms debounce

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [city, bhk, furnishing, propertyType]);

  function currency(x) {
    if (x == null) return '—';
    // If backend already returns a formatted string (e.g. "12.34 Lac" or "0.12 Cr"), show it as-is
    if (typeof x === 'string') return x;
    try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(x)); }
    catch { return String(x); }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '2rem auto' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Estimated value</Typography>
              <Typography variant="h3" sx={{ marginTop: 1, color: 'primary.main', fontWeight: 700 }}>{loading ? <CircularProgress size={24} /> : currency(predicted)}</Typography>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2">Estimated breakdown</Typography>

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Box>
                    <Typography variant="body2">Base estimate</Typography>
                    <Typography variant="caption" color="text.secondary">Model output</Typography>
                  </Box>
                  <Typography variant="body2">{predicted ? currency(predicted) : '—'}</Typography>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Box>
                    <Typography variant="body2">Adjustment</Typography>
                    <Typography variant="caption" color="text.secondary">Furnishing / type</Typography>
                  </Box>
                  <Typography variant="body2">Included</Typography>
                </Box>

                {error && <Typography color="error" sx={{ marginTop: 2 }}>{error}</Typography>}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Enter Property Details</Typography>

              <form noValidate autoComplete="off" style={{ marginTop: 12 }}>
                <FormControl fullWidth sx={{ marginBottom: 2 }}>
                  <Autocomplete
                    freeSolo
                    options={cities || []}
                    value={city}
                    onChange={(e, v) => { setCity(v || ''); setCityTouched(true); }}
                    inputValue={city}
                    onInputChange={(e, val) => { setCity(val); setCityTouched(true); }}
                    renderInput={(params) => <TextField {...params} label="City" helperText="Type or pick a city" />}
                  />
                </FormControl>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="bhk-label">BHK</InputLabel>
                      <Select labelId="bhk-label" value={bhk} label="BHK" onChange={e=>setBhk(Number(e.target.value))}>
                        <MenuItem value={1}>1 BHK</MenuItem>
                        <MenuItem value={2}>2 BHK</MenuItem>
                        <MenuItem value={3}>3 BHK</MenuItem>
                        <MenuItem value={4}>4 BHK</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="furn-label">Furnishing</InputLabel>
                      <Select labelId="furn-label" value={furnishing} label="Furnishing" onChange={e=>setFurnishing(e.target.value)}>
                        <MenuItem value={'Furnished'}>Furnished</MenuItem>
                        <MenuItem value={'Unfurnished'}>Unfurnished</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="type-label">Property Type</InputLabel>
                      <Select labelId="type-label" value={propertyType} label="Property Type" onChange={e=>setPropertyType(e.target.value)}>
                        <MenuItem value={'Apartment'}>Apartment</MenuItem>
                        <MenuItem value={'Villa'}>Villa</MenuItem>
                        <MenuItem value={'House'}>House</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button variant="contained" onClick={() => {
                      // manual trigger for prediction (show here AND navigate to /prediction like before)
                      if (!city) return setError('Please provide a city');
                      setLoading(true);
                      api.post('/api/predict/', { bhk, furnishing, property_type: propertyType, city })
                        .then(res => {
                          setPredicted(res.predicted_price);
                          // Also navigate to the standalone Prediction page with same state (matches previous behavior)
                          nav('/prediction', { state: { predicted_price: res.predicted_price } });
                        })
                        .catch(err => setError(err.message || 'Prediction failed'))
                        .finally(()=>setLoading(false));
                    }}>{loading ? <CircularProgress size={18} /> : 'Predict'}</Button>

                    <Button variant="outlined" onClick={() => {
                      // quick action: open Prediction page with current prediction (if available)
                      if (!predicted) return setError('No prediction available yet');
                      nav('/prediction', { state: { predicted_price: predicted } });
                    }}>Open prediction page</Button>
                  </Grid>
                </Grid>

                <div style={{ marginTop: 16 }}>
                  <Typography variant="body2" color="text.secondary">Predictions update automatically while you change inputs (debounced).</Typography>
                </div>

              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
