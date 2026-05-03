import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to recenter map when driver location updates
const RecenterAutomatically = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

const LiveMap = ({ status, driverLocation, pickupPoints }) => {
  const defaultCenter = [28.6139, 77.2090]; // Default location
  
  let center = defaultCenter;
  let driverPos = null;

  if (driverLocation && driverLocation.lat && driverLocation.lng) {
    driverPos = [driverLocation.lat, driverLocation.lng];
    center = driverPos;
  } else if (pickupPoints && pickupPoints.length > 0 && pickupPoints[0].coordinates) {
    // MongoDB stores as [lng, lat]
    center = [pickupPoints[0].coordinates[1], pickupPoints[0].coordinates[0]];
  }

  return (
    <div className="w-full h-64 bg-gray-200 rounded-xl overflow-hidden relative flex items-center justify-center border-2 border-transparent shadow-sm">
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%", zIndex: 1 }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {driverPos && (
          <Marker position={driverPos}>
            <Popup>Driver Location</Popup>
          </Marker>
        )}
        
        {pickupPoints && pickupPoints.map((point, idx) => {
          if (point.coordinates && point.coordinates.length === 2) {
             const pos = [point.coordinates[1], point.coordinates[0]];
             return (
               <Marker key={idx} position={pos}>
                  <Popup>{point.address || 'Pickup Point'}</Popup>
               </Marker>
             );
          }
          return null;
        })}
        {driverPos && <RecenterAutomatically lat={driverPos[0]} lng={driverPos[1]} />}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
