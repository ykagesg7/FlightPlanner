import type * as L from 'leaflet';

export interface Airport {
  value: string;
  name: string;
  label: string;
  type: 'civilian' | 'military' | 'joint';
  latitude: number;
  longitude: number;
}

export interface Navaid {
  id: string;
  name: string;
  type: 'VOR' | 'TACAN' | 'VORTAC';
  latitude: number;
  longitude: number;
}

export interface Waypoint {
  id: string;
  name: string;
  type: 'airport' | 'navaid' | 'custom';
  sourceId?: string;
  coordinates: [number, number];
  ch?: string;
  latitude: number;
  longitude: number;
  nameEditable?: boolean;
  metadata?: WaypointMetadata;
}

export interface WaypointMetadata {
  baseNavaid: string;
  bearing: number;
  distance: number;
  baseLatitude: number;
  baseLongitude: number;
}

export interface FlightPlan {
  departure: Airport | null;
  arrival: Airport | null;
  waypoints: Waypoint[];
  speed: number;
  altitude: number;
  departureTime: string;
  tas: number;
  mach: number;
  totalDistance: number;
  ete?: string;
  eta?: string;
}

export interface GeoJSONFeature {
  type: string;
  properties: {
    name?: string;
    type?: string;
    frequency?: number;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

export interface GeoJSONData extends L.GeoJSON {
  features: GeoJSONFeature[];
}