import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { AuthContext } from '../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const publicTabs = [
    { label: 'Login', to: '/login' },
    { label: 'Register', to: '/register' },
  ];

  const privateTabs = [
    { label: 'Buy', to: '/properties' },
    { label: 'Sell', to: '/sell' },
    { label: 'Predict', to: '/details' },
  ];

  const tabs = user ? privateTabs : publicTabs;

  return (
    <header style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: 12 }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}><h1 style={{ margin: 0 }}>Real Estate Predictor</h1></Link>

      <Box sx={{ flex: 1, mx: 3 }}>
        <Tabs
          value={location.pathname}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="main navigation"
        >
          {tabs.map(t => (
            <Tab
              key={t.to}
              label={t.label}
              value={t.to}
              component={Link}
              to={t.to}
              aria-current={location.pathname === t.to ? 'page' : undefined}
            />
          ))}
        </Tabs>
      </Box>

      <div>
        {user ? (
          <>
            <span style={{ marginRight: 12 }}>Hi, {user.username}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : null}
      </div>
    </header>
  );
}
