import { CONVERSION_FACTORS } from './constants';
import { UnitSystem, TruckDimensions, Dimensions } from '../models/types';

/**
 * Convert length from metric to imperial
 * @param value Value in meters
 * @returns Value in feet
 */
export const meterToFeet = (value: number): number => {
  return value * CONVERSION_FACTORS.LENGTH.METER_TO_FEET;
};

/**
 * Convert length from imperial to metric
 * @param value Value in feet
 * @returns Value in meters
 */
export const feetToMeter = (value: number): number => {
  return value * CONVERSION_FACTORS.LENGTH.FEET_TO_METER;
};

/**
 * Convert weight from metric to imperial
 * @param value Value in kilograms
 * @returns Value in pounds
 */
export const kgToLb = (value: number): number => {
  return value * CONVERSION_FACTORS.WEIGHT.KG_TO_LB;
};

/**
 * Convert weight from imperial to metric
 * @param value Value in pounds
 * @returns Value in kilograms
 */
export const lbToKg = (value: number): number => {
  return value * CONVERSION_FACTORS.WEIGHT.LB_TO_KG;
};

/**
 * Convert volume from metric to imperial
 * @param value Value in cubic meters
 * @returns Value in cubic feet
 */
export const cubicMeterToCubicFeet = (value: number): number => {
  return value * CONVERSION_FACTORS.VOLUME.CUBIC_METER_TO_CUBIC_FEET;
};

/**
 * Convert volume from imperial to metric
 * @param value Value in cubic feet
 * @returns Value in cubic meters
 */
export const cubicFeetToCubicMeter = (value: number): number => {
  return value * CONVERSION_FACTORS.VOLUME.CUBIC_FEET_TO_CUBIC_METER;
};

/**
 * Safely convert a potentially undefined value
 * @param value The value to convert
 * @param converter The conversion function
 * @returns Converted value or undefined
 */
const safeConvert = (value: number | undefined, converter: (val: number) => number): number | undefined => {
  return value !== undefined ? converter(value) : undefined;
};

/**
 * Convert dimensions from one unit system to another
 * @param dimensions Dimensions object
 * @param fromUnit Source unit system
 * @param toUnit Target unit system
 * @returns Converted dimensions
 */
export const convertDimensions = (
  dimensions: Dimensions,
  fromUnit: UnitSystem,
  toUnit: UnitSystem
): Dimensions => {
  if (fromUnit === toUnit) {
    return { ...dimensions };
  }

  if (fromUnit === 'metric' && toUnit === 'imperial') {
    return {
      length: meterToFeet(dimensions.length),
      width: meterToFeet(dimensions.width),
      height: meterToFeet(dimensions.height),
    };
  } else {
    return {
      length: feetToMeter(dimensions.length),
      width: feetToMeter(dimensions.width),
      height: feetToMeter(dimensions.height),
    };
  }
};

/**
 * Convert truck dimensions from one unit system to another
 * @param truckDimensions Truck dimensions object
 * @param fromUnit Source unit system
 * @param toUnit Target unit system
 * @returns Converted truck dimensions
 */
export const convertTruckDimensions = (
  truckDimensions: TruckDimensions,
  fromUnit: UnitSystem,
  toUnit: UnitSystem
): TruckDimensions => {
  if (fromUnit === toUnit) {
    return { ...truckDimensions };
  }

  if (fromUnit === 'metric' && toUnit === 'imperial') {
    return {
      length: meterToFeet(truckDimensions.length),
      width: meterToFeet(truckDimensions.width),
      height: meterToFeet(truckDimensions.height),
      maxWeight: kgToLb(truckDimensions.maxWeight),
      insideLength: safeConvert(truckDimensions.insideLength, meterToFeet),
      insideWidth: safeConvert(truckDimensions.insideWidth, meterToFeet),
      insideHeight: safeConvert(truckDimensions.insideHeight, meterToFeet),
      frameWidth: safeConvert(truckDimensions.frameWidth, meterToFeet),
      cubicCapacity: safeConvert(truckDimensions.cubicCapacity, cubicMeterToCubicFeet),
    };
  } else {
    return {
      length: feetToMeter(truckDimensions.length),
      width: feetToMeter(truckDimensions.width),
      height: feetToMeter(truckDimensions.height),
      maxWeight: lbToKg(truckDimensions.maxWeight),
      insideLength: safeConvert(truckDimensions.insideLength, feetToMeter),
      insideWidth: safeConvert(truckDimensions.insideWidth, feetToMeter),
      insideHeight: safeConvert(truckDimensions.insideHeight, feetToMeter),
      frameWidth: safeConvert(truckDimensions.frameWidth, feetToMeter),
      cubicCapacity: safeConvert(truckDimensions.cubicCapacity, cubicFeetToCubicMeter),
    };
  }
};

/**
 * Format length with appropriate units
 * @param value Length value
 * @param unitSystem Unit system
 * @returns Formatted length string
 */
export const formatLength = (value: number, unitSystem: UnitSystem): string => {
  if (unitSystem === 'metric') {
    return `${value.toFixed(2)} m`;
  } else {
    return `${value.toFixed(2)} ft`;
  }
};

/**
 * Format weight with appropriate units
 * @param value Weight value
 * @param unitSystem Unit system
 * @returns Formatted weight string
 */
export const formatWeight = (value: number, unitSystem: UnitSystem): string => {
  if (unitSystem === 'metric') {
    return `${value.toFixed(2)} kg`;
  } else {
    return `${value.toFixed(2)} lb`;
  }
};

/**
 * Format volume with appropriate units
 * @param value Volume value
 * @param unitSystem Unit system
 * @returns Formatted volume string
 */
export const formatVolume = (value: number, unitSystem: UnitSystem): string => {
  if (unitSystem === 'metric') {
    return `${value.toFixed(2)} m³`;
  } else {
    return `${value.toFixed(2)} ft³`;
  }
}; 