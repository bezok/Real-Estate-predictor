import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';

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
    // Only auto-set the default city if the user hasn't interacted with the field
    if (!city && cities.length && !cityTouched) {
      setCity(property?.location || cities[0]);
    }
  }, [cities, property, city, cityTouched]);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post('/api/predict/', { bhk, furnishing, property_type: propertyType, city });
      nav('/prediction', { state: { predicted_price: res.predicted_price } });
    } catch (err) {
      setError(err.message || 'Prediction failed');
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto' }}>
      <h2>Enter Property Details</h2>
      <form onSubmit={submit}>
        <div>
          <label>City</label>
          <input
            list="cities-list"
            value={city}
            onChange={e => { setCity(e.target.value); setCityTouched(true); }}
            required
          />
          <datalist id="cities-list">
            {cities.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div>
          <label>BHK</label>
          <select value={bhk} onChange={e=>setBhk(Number(e.target.value))}>
            <option value={1}>1 BHK</option>
            <option value={2}>2 BHK</option>
            <option value={3}>3 BHK</option>
            <option value={4}>4 BHK</option>
          </select>
        </div>
        <div>
          <label>Furnishing</label>
          <select value={furnishing} onChange={e=>setFurnishing(e.target.value)}>
            <option>Furnished</option>
            <option>Unfurnished</option>
          </select>
        </div>
        <div>
          <label>Property Type</label>
          <select value={propertyType} onChange={e=>setPropertyType(e.target.value)}>
            <option>Apartment</option>
            <option>Villa</option>
            <option>House</option>
          </select>
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">Predict Price</button>
      </form>
    </div>
  );
}
