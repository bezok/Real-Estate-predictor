import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

function priceLabel(price) {
  const n = Number(price);
  return n >= 100 ? `₹${(n / 100).toFixed(1)} Cr` : `₹${n} L`;
}

function makePriceIcon(price) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        background: #1565c0;
        color: #fff;
        padding: 5px 11px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        border: 2px solid #fff;
        cursor: pointer;
        transition: background 0.15s;
        font-family: sans-serif;
      ">${priceLabel(price)}</div>
    `,
    iconSize: [80, 32],
    iconAnchor: [40, 16],
    tooltipAnchor: [0, -18],
  });
}

function FitBounds({ properties, center }) {
  const map = useMap();

  useEffect(() => {
    const coords = properties
      .filter(p => p.lat && p.lng)
      .map(p => [Number(p.lat), Number(p.lng)]);

    if (coords.length === 0) {
      map.setView(center, 7);
    } else if (coords.length === 1) {
      map.setView(coords[0], 12);
    } else {
      map.fitBounds(coords, { padding: [50, 50] });
    }
  }, [map, properties, center]);

  return null;
}

export default function PropertyMap({ properties = [] }) {
  const center = [10.0889, 76.2415];
  const navigate = useNavigate();

  return (
    <MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds properties={properties} center={center} />

      {properties.map(p =>
        p.lat && p.lng ? (
          <Marker
            key={p.id}
            position={[Number(p.lat), Number(p.lng)]}
            icon={makePriceIcon(p.price)}
            eventHandlers={{
              click: () => navigate(`/properties/${p.id}`),
            }}
          >
            <Tooltip direction="top" offset={[0, -20]}>
              <strong>{p.title}</strong>
              <br />
              {p.location}
            </Tooltip>
          </Marker>
        ) : null
      )}
    </MapContainer>
  );
}
