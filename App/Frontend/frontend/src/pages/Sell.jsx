import React, { useState } from 'react';
import api from '../api/api';

export default function Sell() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState(null);

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post('/api/properties/create/', { title, description, price, location, is_for_sale: true });
      setMessage('Property listed successfully');
      setTitle(''); setDescription(''); setPrice(''); setLocation('');
    } catch (err) {
      setMessage(err.message || 'Failed to list property');
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto' }}>
      <h2>List Your Property</h2>
      <form onSubmit={submit}>
        <div>
          <label>Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Description</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} />
        </div>
        <div>
          <label>Price (in Lakhs)</label>
          <input type="number" value={price} onChange={e=>setPrice(e.target.value)} required />
        </div>
        <div>
          <label>Location</label>
          <input value={location} onChange={e=>setLocation(e.target.value)} required />
        </div>
        <button type="submit">List Property</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
