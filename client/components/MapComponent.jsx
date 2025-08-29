import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapComponent({ className = "" }) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      <MapContainer
        center={[28.6139, 77.209]}
        zoom={12}
        className="absolute inset-0 z-0"
        zoomControl={false}
        preferCanvas
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
      </MapContainer>
    </div>
  );
}
