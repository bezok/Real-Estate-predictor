import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function Prediction() {
  const loc = useLocation();
  const predicted = loc.state?.predicted_price;

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto' }}>
      <h2>Estimated Property Price</h2>
      {predicted ? (
        <div style={{ padding: 12, border: '1px solid #ddd', background: '#fafafa' }}>
          <h3>Price: ₹ {predicted}</h3>
          <p>*Based on current data trends, may be subject to slight variation.</p>
        </div>
      ) : (
        <p>No prediction found. Please submit details first (<Link to="/details">Details</Link>).</p>
      )}
    </div>
  );
}
