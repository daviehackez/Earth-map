/**
 * Weather & Storm tracking data definitions for VortexGlobe
 */

export type SaffirSimpsonCategory = 0 | 1 | 2 | 3 | 4 | 5;

export type OceanBasin = 
  | 'North Atlantic'
  | 'Eastern Pacific'
  | 'Western Pacific'
  | 'North Indian'
  | 'South Pacific'
  | 'South Indian';

export interface StormWaypoint {
  hours: number; // e.g. +12, +24, +48, +72, +96, +120
  lat: number;
  lon: number;
  windSpeedKnots: number;
  pressureHpa: number;
  category: SaffirSimpsonCategory;
  uncertaintyRadiusKm: number; // For forecast cone width
  timestamp: string;
}

export interface WindRadii {
  // Nautical miles extent in 4 quadrants [NE, SE, SW, NW]
  radius34kt: [number, number, number, number];
  radius50kt: [number, number, number, number];
  radius64kt: [number, number, number, number];
}

export interface StormSystem {
  id: string;
  name: string;
  basin: OceanBasin;
  category: SaffirSimpsonCategory;
  categoryLabel: string; // e.g. "Category 5 Super Typhoon", "Category 4 Major Hurricane"
  center: {
    lat: number;
    lon: number;
  };
  windSpeedKnots: number;
  gustsKnots: number;
  pressureHpa: number;
  movementHeadingDeg: number;
  movementSpeedKnots: number;
  radiusKm: number; // Eyewall visual radius on globe
  color: string;
  historicalTrack: { lat: number; lon: number }[];
  forecast: StormWaypoint[];
  radii: WindRadii;
  status: 'Active' | 'Rapidly Intensifying' | 'Weakening' | 'Landfall Imminent';
  advisoryNumber: string;
  formationDate: string;
  satelliteImageRef?: string;
  summary: string;
}

export type SpeedUnit = 'knots' | 'mph' | 'kmh';

export interface LayerVisibility {
  radar: boolean;
  windVectors: boolean;
  forecastCones: boolean;
  cloudVortex: boolean;
  dayNight: boolean;
  gridLines: boolean;
}
