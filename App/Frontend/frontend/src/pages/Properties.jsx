import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

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
    <div style={{ maxWidth: 960, margin: '1rem auto' }}>
      <h2>Properties for Sale</h2>
      <div style={{ marginBottom: 12 }}>
        <form onSubmit={search}>
          <input placeholder="Search by location or name" value={q} onChange={e=>setQ(e.target.value)} />
          <button type="submit">Search</button>
          <button type="button" onClick={load} style={{ marginLeft: 8 }}>Refresh</button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {list.length === 0 && <div>No properties available.</div>}
        {list.map(p => (
          <div key={p.id} style={{ border: '1px solid #ddd', padding: 12 }}>
            <h3>{p.title}</h3>
            <p>{p.location}</p>
            <p>₹{p.price} Lakhs</p>
            <button onClick={() => nav(`/details`, { state: { property: p } })}>View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}
