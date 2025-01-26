import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import { FlightPlan, GeoJSONData } from '../types';
import 'leaflet/dist/leaflet.css';
import 'leaflet-groupedlayercontrol/dist/leaflet.groupedlayercontrol.min.css';
import 'leaflet-groupedlayercontrol';
import L from 'leaflet';
import icon from '/images/marker-icon.png';
import iconShadow from '/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LayerControlRef {
  current: L.Control.Layers | null;
}

interface MapTabProps {
  flightPlan: FlightPlan;
}

const MapTab: React.FC<MapTabProps> = ({ flightPlan }) => {
  const defaultCenter = { lat: 35.6762, lng: 139.6503 }; // Tokyo
  const defaultZoom = 6;

  // ルートの座標を作成 (MapContainerの外で定義)
  const routePoints = React.useMemo(() => {
    const points: [number, number][] = [];
    if (flightPlan.departure && typeof flightPlan.departure.latitude === 'number' && typeof flightPlan.departure.longitude === 'number') {
      points.push([flightPlan.departure.latitude, flightPlan.departure.longitude]);
    }
    flightPlan.waypoints.forEach(waypoint => {
      if (waypoint && typeof waypoint.latitude === 'number' && typeof waypoint.longitude === 'number') {
        points.push([waypoint.latitude, waypoint.longitude]);
      }
    });
    if (flightPlan.arrival && typeof flightPlan.arrival.latitude === 'number' && typeof flightPlan.arrival.longitude === 'number') {
      points.push([flightPlan.arrival.latitude, flightPlan.arrival.longitude]);
    }
    return points;
  }, [flightPlan]);


  return (
    <div className="h-[calc(100vh-12rem)] bg-white rounded-lg shadow-sm overflow-hidden">
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={defaultZoom}
        className="h-full w-full"
      >
        <MapContent flightPlan={flightPlan} routePoints={routePoints} /> {/* MapContentコンポーネントに分離 */}
      </MapContainer>
    </div>
  );
};

// MapContent コンポーネント (MapContainerの子コンポーネントとして分離)
const MapContent: React.FC<{ flightPlan: FlightPlan, routePoints: [number, number][] }> = ({ flightPlan, routePoints }) => {
  const map = useMap();
  const layerControlRef = useRef<L.Control.Layers | null>(null) as LayerControlRef;

  // OpenStreetMapレイヤー
  const osmLayer = useMemo(() => L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  ), []);

  // 衛星写真レイヤー
  const esriLayer = useMemo(() => L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }
  ), []);

  const baseLayers = useMemo(() => ({
    "地図": osmLayer,
    "衛星写真": esriLayer
  }), [osmLayer, esriLayer]);

  // レイヤーコントロールの更新
  const control = L.control.layers(baseLayers, {});

  useEffect(() => {
    if (!map) {
      console.error('Map instance is not available');
      return;
    }

    try {
      const control = L.control.layers(baseLayers, {});
      control.addTo(map);
      layerControlRef.current = control;

      if (!map.hasLayer(osmLayer)) {
        osmLayer.addTo(map);
      }
    } catch (error) {
      console.error('Layer initialization failed:', error);
    }

    return () => {
      if (map && layerControlRef.current) {
        map.removeControl(layerControlRef.current);
        layerControlRef.current = null;
      }
    };
  }, [map, baseLayers, osmLayer]);

  return (
    <>
      {/* レイヤーはuseEffect内で追加するため、ここでは何も表示しない */}
      {/* ルートの線を追加 */}
      {routePoints.length > 1 && (
        <Polyline positions={routePoints} color="blue" weight={2} />
      )}
      {/* 出発空港のマーカー (CircleMarkerに変更) */}
      {flightPlan.departure && (
        <CircleMarker
          center={[flightPlan.departure.latitude, flightPlan.departure.longitude]}
          radius={6} // 円の半径
          fillColor="green" // 円の塗りつぶし色
          color="green"     // 円の線の色 (塗りつぶし色と同じにすると線が消える)
          weight={1}        // 円の線の太さ
          fillOpacity={0.8}  // 塗りつぶしの透明度
        >
          <Popup>
            <div>
              <h2 className="font-bold text-lg">{flightPlan.departure.name}</h2>
              <p className="text-sm text-gray-500">Departure Airport</p>
            </div>
          </Popup>
        </CircleMarker>
      )}
      {/* 到着空港のマーカー (CircleMarkerに変更) */}
      {flightPlan.arrival && (
        <CircleMarker
          center={[flightPlan.arrival.latitude, flightPlan.arrival.longitude]}
          radius={6}
          fillColor="red"
          color="red"
          weight={1}
          fillOpacity={0.8}
        >
          <Popup>
            <div>
              <h2 className="font-bold text-lg">{flightPlan.arrival.name}</h2>
              <p className="text-sm text-gray-500">Arrival Airport</p>
            </div>
          </Popup>
        </CircleMarker>
      )}
      {/* ウェイポイントのマーカー (CircleMarkerに変更) */}
      {flightPlan.waypoints.map((waypoint, index) => (
        <CircleMarker
          key={index}
          center={[waypoint.latitude, waypoint.longitude]}
          radius={5}
          fillColor="blue"
          color="blue"
          weight={1}
          fillOpacity={0.6}
        >
          <Popup>
            <div>
              <h2 className="font-bold text-lg">{waypoint.name}</h2>
              <p className="text-sm text-gray-500">Waypoint</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
};


export default MapTab;