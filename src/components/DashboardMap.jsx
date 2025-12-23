import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { useTheme } from '../contexts/ThemeContext'; // Ensure theme context is used if needed/available, but TileLayer handles basic look.

const center = [-4.5, -53.0]; // Approximate center of Pará
const zoom = 6;

const cities = [
    { name: 'Belém', position: [-1.4558, -48.5023], count: 150 },
    { name: 'Santarém', position: [-2.4430, -54.7082], count: 85 },
    { name: 'Marabá', position: [-5.3686, -49.1179], count: 60 },
    { name: 'Castanhal', position: [-1.2964, -47.9250], count: 40 },
    { name: 'Parauapebas', position: [-6.0673, -49.9032], count: 95 },
    { name: 'Altamira', position: [-3.2033, -52.2065], count: 25 },
    { name: 'Tucuruí', position: [-3.7661, -49.6725], count: 30 },
    { name: 'Barcarena', position: [-1.5058, -48.6258], count: 55 },
];

const getColor = (count) => {
    if (count > 100) return '#ef4444'; // red-500
    if (count > 80) return '#f97316'; // orange-500
    if (count > 50) return '#eab308'; // yellow-500
    if (count > 30) return '#3b82f6'; // blue-500
    return '#10b981'; // emerald-500
};

export default function DashboardMap() {
    return (
        <div className="h-[450px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative z-0">
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
                className="z-0" // Ensure z-index doesn't conflict with modals
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {cities.map((city, idx) => (
                    <CircleMarker
                        key={idx}
                        center={city.position}
                        radius={8 + Math.sqrt(city.count) * 1.5}
                        pathOptions={{
                            color: getColor(city.count),
                            fillColor: getColor(city.count),
                            fillOpacity: 0.6,
                            weight: 1
                        }}
                    >
                        <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                            <div className="text-center font-sans">
                                <span className="font-bold block text-sm text-slate-800">{city.name}</span>
                                <span className="text-xs font-semibold text-slate-600">{city.count} Vagas</span>
                            </div>
                        </Tooltip>
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    );
}
