"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Map({
  centerLat,
  centerLon,
  places,
}) {
  return (
    <MapContainer
      center={[centerLat, centerLon]}
      zoom={12}
      scrollWheelZoom={true}
      className="h-[500px] w-full rounded-2xl z-0"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {places.map((place, index) => (
        <Marker
          key={index}
          position={[place.lat, place.lon]}
        >
          <Popup>
            <div>
              <h3 className="font-bold">
                {place.name}
              </h3>

              <p>{place.label}</p>

              <p>{place.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}