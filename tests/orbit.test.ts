import { describe, expect, it } from "vitest";
import {
  altitudeFromSlider,
  eccentricAnomaly,
  formatDuration,
  orbitFor,
  sliderFromAltitude,
  speedAt,
} from "../lib/orbit";

describe("orbit maths", () => {
  it("gives the real period and speed of a low Earth orbit", () => {
    const orbit = orbitFor(408);
    expect(orbit.period / 60).toBeCloseTo(92.6, 0);
    expect(speedAt(orbit.perigee, orbit.semiMajorAxis)).toBeCloseTo(7.67, 1);
  });

  it("moves slower at apogee than at perigee", () => {
    const orbit = orbitFor(35786);
    const atPerigee = speedAt(orbit.perigee, orbit.semiMajorAxis);
    const atApogee = speedAt(orbit.apogee, orbit.semiMajorAxis);
    expect(atApogee).toBeLessThan(atPerigee / 5);
  });

  it("gives a transfer time to the Moon of about five days each way", () => {
    expect(orbitFor(384400).period / 86400 / 2).toBeCloseTo(4.9, 0);
  });

  it("solves Kepler's equation at high eccentricity", () => {
    for (const M of [0.01, 1, 3, 5, 6.2]) {
      const E = eccentricAnomaly(M, 0.9);
      expect(E - 0.9 * Math.sin(E)).toBeCloseTo(M, 6);
    }
  });

  it("round-trips the slider scale", () => {
    expect(altitudeFromSlider(sliderFromAltitude(35786))).toBeCloseTo(35786, 3);
  });

  it("formats durations for people", () => {
    expect(formatDuration(5520)).toBe("92 min");
    expect(formatDuration(36000)).toBe("10.0 hours");
    expect(formatDuration(864000)).toBe("10.0 days");
  });
});
