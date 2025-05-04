import { TruckDimensions, UnitSystem } from '../models/types';

// Default 53-foot truck dimensions
export const DEFAULT_TRUCK_DIMENSIONS_METRIC: TruckDimensions = {
  length: 16.15, // meters
  width: 2.591, // meters
  height: 4.267, // meters
  maxWeight: 20000, // kg
  insideLength: 16.15, // meters
  insideWidth: 2.54, // meters
  insideHeight: 2.946, // meters
  frameWidth: 2.591, // meters
  cubicCapacity: 120.91, // cubic meters
};

export const DEFAULT_TRUCK_DIMENSIONS_IMPERIAL: TruckDimensions = {
  length: 53, // feet
  width: 102, // inches
  height: 168, // inches (14 feet)
  maxWeight: 44092, // pounds
  insideLength: 53, // feet
  insideWidth: 100, // inches
  insideHeight: 116, // inches
  frameWidth: 102, // inches
  cubicCapacity: 4270, // cubic feet
};

// Conversion factors
export const CONVERSION_FACTORS = {
  LENGTH: {
    METER_TO_FEET: 3.28084,
    FEET_TO_METER: 0.3048,
  },
  WEIGHT: {
    KG_TO_LB: 2.20462,
    LB_TO_KG: 0.453592,
  },
  VOLUME: {
    CUBIC_METER_TO_CUBIC_FEET: 35.3147,
    CUBIC_FEET_TO_CUBIC_METER: 0.0283168,
  },
};

// Color constants for 3D visualization
export const COLORS = {
  TRUCK_FLOOR: '#8d8d8d',
  TRUCK_WALLS: '#d3d3d3',
  TRUCK_FRAME: '#484848',
  DEFAULT_SKID: '#00897b',
  SKID: '#64b5f6',           // Default skid color
  FRAGILE: '#ef5350',        // Color for fragile skids
  STACKABLE: '#66bb6a',      // Color for stackable skids
  PRIORITY_COLORS: [
    '#e53935', // Priority 1 - Red
    '#ff9800', // Priority 2 - Orange
    '#ffeb3b', // Priority 3 - Yellow
    '#4caf50', // Priority 4 - Green
    '#2196f3', // Priority 5 - Blue
    '#9c27b0', // Priority 6 - Purple
  ],
  SEQUENCE: [
    '#e57373', // Light red
    '#f06292', // Light pink
    '#ba68c8', // Light purple
    '#9575cd', // Light deep purple
    '#7986cb', // Light indigo
    '#64b5f6', // Light blue
    '#4fc3f7', // Light light blue
    '#4dd0e1', // Light cyan
    '#4db6ac', // Light teal
    '#81c784', // Light green
    '#aed581', // Light light green
    '#dce775', // Light lime
    '#fff176', // Light yellow
    '#ffd54f', // Light amber
    '#ffb74d', // Light orange
    '#ff8a65', // Light deep orange
  ],
};

// Theme colors for UI
export const THEME_COLORS = {
  PRIMARY: '#1a3a5f',
  SECONDARY: '#00897b',
  ACCENT: '#ffab00',
  SUCCESS: '#43a047',
  WARNING: '#f57c00',
  ERROR: '#e53935',
  BACKGROUND_LIGHT: '#f5f5f5',
  BACKGROUND_DARK: '#212121',
};

// Default units
export const DEFAULT_UNIT_SYSTEM: UnitSystem = 'metric';

// Maximum allowed weight for the truck (in kg for metric, lb for imperial)
export const MAX_WEIGHT = {
  METRIC: 20000, // kg
  IMPERIAL: 44092, // lb
};

// Algorithm configuration
export const ALGORITHM_CONFIG = {
  MAX_ITERATIONS: 1000,
  WEIGHT_DISTRIBUTION_THRESHOLD: 0.1, // 10% threshold for weight imbalance
  PRIORITY_WEIGHT: 0.7, // Weight factor for priority in optimization
}; 