import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix leaflet's default icon paths so markers display correctly
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function FitBounds({ properties, center }) {
  const map = useMap();

  useEffect(() => {
    const coords = properties
      .filter(p => p.lat && p.lng)
      .map(p => [Number(p.lat), Number(p.lng)]);

    if (coords.length === 0) {
      map.setView(center, 7);
    } else if (coords.length === 1) {
      map.setView(coords[0], 10);
    } else {
      map.fitBounds(coords, { padding: [50, 50] });
    }
  }, [map, properties, center]);

  return null;
}

export default function PropertyMap({ properties = [] }) {
  const center =[10.0889, 76.2415]; // India default

  return (
    <MapContainer center={center} zoom={50} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds properties={properties} center={center} />

      {properties.map(p => (
        p.lat && p.lng && (
          <Marker key={p.id} position={[Number(p.lat), Number(p.lng)]}>
            <Popup>
              <strong>{p.title}</strong><br />
              ₹{p.price} Lakhs<br />
              {p.location}
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
}
