import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import api from '../api/api';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';

function LocationPicker({ onPick, pickedPos }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return pickedPos ? <Marker position={pickedPos} /> : null;
}

export default function Sell() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [furnishing, setFurnishing] = useState('Unfurnished');
  const [bhk, setBhk] = useState(1);
  const [propertyType, setPropertyType] = useState('Flat');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [message, setMessage] = useState(null);
  const [severity, setSeverity] = useState('success');
  const nav = useNavigate();

  function handleImageChange(e) {
    const file = e.target.files[0];
    setImage(file || null);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  function handlePick(la, ln) {
    setLat(la);
    setLng(ln);
  }

  function resetForm() {
    setTitle(''); setDescription(''); setPrice(''); setLocation('');
    setFurnishing('Unfurnished'); setBhk(1); setPropertyType('Flat');
    setImage(null); setImagePreview(null);
    setLat(null); setLng(null); setShowMapPicker(false);
    setMessage(null);
  }

  async function submit(e) {
    e.preventDefault();
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      fd.append('price', price);
      fd.append('location', location);
      fd.append('is_for_sale', 'true');
      fd.append('furnishing', furnishing);
      fd.append('bhk', bhk);
      fd.append('property_type', propertyType);
      if (image) fd.append('image', image);
      if (lat !== null) fd.append('latitude', lat);
      if (lng !== null) fd.append('longitude', lng);

      const res = await api.postForm('/api/properties/create/', fd);
      setSeverity('success');
      setMessage(res.appended_row
        ? `Property listed successfully. Added to dataset: ${res.appended_row}`
        : 'Property listed successfully');

      resetForm();
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
            <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} required fullWidth />
            <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} multiline rows={4} fullWidth />
            <TextField label="Price (in Lakhs)" type="number" value={price} onChange={e => setPrice(e.target.value)} required fullWidth />
            <TextField label="Location" value={location} onChange={e => setLocation(e.target.value)} required fullWidth />

            <TextField select label="Furnishing" value={furnishing} onChange={e => setFurnishing(e.target.value)} fullWidth>
              <MenuItem value="Furnished">Furnished</MenuItem>
              <MenuItem value="Semi-Furnished">Semi-Furnished</MenuItem>
              <MenuItem value="Unfurnished">Unfurnished</MenuItem>
            </TextField>

            <TextField label="BHK" type="number" value={bhk} onChange={e => setBhk(Number(e.target.value))} required fullWidth />

            <TextField select label="Property Type" value={propertyType} onChange={e => setPropertyType(e.target.value)} fullWidth>
              <MenuItem value="Flat">Flat</MenuItem>
              <MenuItem value="House">House</MenuItem>
              <MenuItem value="Villa">Villa</MenuItem>
            </TextField>

            {/* Image upload */}
            <Box>
              <Button variant="outlined" component="label" fullWidth>
                {image ? image.name : 'Upload Property Image (optional)'}
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </Button>
              {imagePreview && (
                <Box sx={{ mt: 1 }}>
                  <img src={imagePreview} alt="preview" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 4 }} />
                </Box>
              )}
            </Box>

            {/* Map pin picker */}
            <Box>
              <Button
                type="button"
                variant="outlined"
                fullWidth
                onClick={() => setShowMapPicker(v => !v)}
              >
                {showMapPicker ? 'Hide map' : 'Pin exact location on map (optional)'}
              </Button>

              {lat !== null && lng !== null && (
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  Pinned: {lat.toFixed(5)}, {lng.toFixed(5)}
                  <Button size="small" sx={{ ml: 1 }} onClick={() => { setLat(null); setLng(null); }}>
                    Clear
                  </Button>
                </Typography>
              )}

              {showMapPicker && (
                <Box sx={{ mt: 1, height: 280, borderRadius: 1, overflow: 'hidden', border: '1px solid #ccc' }}>
                  <MapContainer
                    center={[20.5937, 78.9629]}
                    zoom={5}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationPicker
                      onPick={handlePick}
                      pickedPos={lat !== null ? [lat, lng] : null}
                    />
                  </MapContainer>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button type="submit" variant="contained">List Property</Button>
              <Button type="button" variant="outlined" onClick={resetForm}>Reset</Button>
            </Box>

            {message && <Alert severity={severity}>{message}</Alert>}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
