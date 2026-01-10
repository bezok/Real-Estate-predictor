import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header style={{ padding: '1rem', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}><h1>Real Estate Predictor</h1></Link>
      </div>
      <nav>
        <Link to="/properties" style={{ marginRight: 12 }}>Buy</Link>
        <Link to="/sell" style={{ marginRight: 12 }}>Sell</Link>
        <Link to="/details" style={{ marginRight: 12 }}>Predict</Link>
        {user ? (
          <>
            <span style={{ marginRight: 12 }}>Hi, {user.username}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: 12 }}>Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
