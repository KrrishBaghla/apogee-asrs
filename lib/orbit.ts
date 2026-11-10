// Two-body orbit maths for the hero simulator. Distances in km, times in seconds.

const EARTH_RADIUS = 6371;
const EARTH_MU = 398600.4418;
const PERIGEE_ALTITUDE = 400;

export const MIN_APOGEE = 408;
export const MAX_APOGEE = 400000;

export function orbitFor(apogeeAltitude: number) {
  const perigee = EARTH_RADIUS + PERIGEE_ALTITUDE;
  const apogee = EARTH_RADIUS + apogeeAltitude;
  const semiMajorAxis = (perigee + apogee) / 2;
  return {
    perigee,
    apogee,
    semiMajorAxis,
    period: 2 * Math.PI * Math.sqrt(semiMajorAxis ** 3 / EARTH_MU),
  };
}

// Vis-viva equation: speed in km/s at distance r from Earth's centre.
export function speedAt(r: number, semiMajorAxis: number) {
  return Math.sqrt(EARTH_MU * (2 / r - 1 / semiMajorAxis));
}

// Solves Kepler's equation M = E - e sin E with Newton's method.
export function eccentricAnomaly(meanAnomaly: number, eccentricity: number) {
  let E = eccentricity > 0.8 ? Math.PI : meanAnomaly;
  for (let i = 0; i < 12; i++) {
    E -= (E - eccentricity * Math.sin(E) - meanAnomaly) / (1 - eccentricity * Math.cos(E));
  }
  return E;
}

// The slider is logarithmic so that 408 km and 400,000 km both fit on one scale.
export function altitudeFromSlider(t: number) {
  return MIN_APOGEE * (MAX_APOGEE / MIN_APOGEE) ** t;
}

export function sliderFromAltitude(altitude: number) {
  return Math.log(altitude / MIN_APOGEE) / Math.log(MAX_APOGEE / MIN_APOGEE);
}

export function formatDuration(seconds: number) {
  const minutes = Math.round(seconds / 60);
  if (minutes < 120) return `${minutes} min`;
  const hours = seconds / 3600;
  if (hours < 48) return `${hours.toFixed(1)} hours`;
  return `${(hours / 24).toFixed(1)} days`;
}
