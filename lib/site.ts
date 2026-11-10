export const site = {
  club: "Apogee",
  name: "Apogee Space Research Suite",
  shortName: "ASRS",
  description:
    "Learn to build real space technology, one project at a time, with the Apogee space club.",
};

export const levelNames: Record<number, string> = {
  1: "Beginner",
  2: "Beginner+",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

export const levelOrbits: Record<number, { place: string; height: string }> = {
  1: { place: "the Space Station", height: "408 km up" },
  2: { place: "the GPS satellites", height: "20,200 km up" },
  3: { place: "geostationary orbit", height: "35,786 km up" },
  4: { place: "the Moon", height: "384,400 km away" },
  5: { place: "the James Webb telescope", height: "1.5 million km away" },
};
