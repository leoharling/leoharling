"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Photo } from "@/lib/supabase";

// Custom marker icon
const markerIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="24" height="24"><path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 16 8 16s8-10.75 8-16c0-4.42-3.58-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>`),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

interface PhotoMapProps {
  photos: Photo[];
}

export default function PhotoMap({ photos }: PhotoMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const geoPhotos = photos.filter(
    (p) => p.latitude != null && p.longitude != null
  );

  if (!mounted) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-xl border border-white/5 bg-card">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  if (geoPhotos.length === 0) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-xl border border-white/5 bg-card">
        <p className="text-muted-foreground">
          No geotagged photos available yet.
        </p>
      </div>
    );
  }

  const center: [number, number] = [
    geoPhotos.reduce((sum, p) => sum + p.latitude!, 0) / geoPhotos.length,
    geoPhotos.reduce((sum, p) => sum + p.longitude!, 0) / geoPhotos.length,
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-white/5">
      <MapContainer
        center={center}
        zoom={3}
        style={{ height: "600px", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoPhotos.map((photo) => (
          <Marker
            key={photo.id}
            position={[photo.latitude!, photo.longitude!]}
            icon={markerIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>{photo.title}</strong>
                {photo.location_name && (
                  <p className="text-gray-600">{photo.location_name}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
