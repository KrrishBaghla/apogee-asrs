const FOCUS_X = 110;
const FOCUS_Y = 200;
const PERIGEE = 42;
const APOGEES = [210, 370, 530, 690, 850];

// Five orbits sharing one perigee, one per level. Each level reaches higher than the last.
export function OrbitStack({ highlight, className }: { highlight?: number; className?: string }) {
  return (
    <svg viewBox="0 0 1000 400" className={className} aria-hidden="true">
      <circle cx={FOCUS_X} cy={FOCUS_Y} r="24" fill="var(--domain)" fillOpacity="0.28" />
      {APOGEES.map((apogee, index) => {
        const active = highlight === index + 1;
        return (
          <g key={apogee}>
            <ellipse
              cx={FOCUS_X + (apogee - PERIGEE) / 2}
              cy={FOCUS_Y}
              rx={(apogee + PERIGEE) / 2}
              ry={Math.sqrt(apogee * PERIGEE)}
              fill="none"
              stroke="var(--domain)"
              strokeOpacity={active ? 1 : 0.32}
              strokeWidth={active ? 3 : 1.5}
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={FOCUS_X + apogee}
              cy={FOCUS_Y}
              r={active ? 13 : 7}
              fill={active ? "var(--accent)" : "var(--domain)"}
            />
          </g>
        );
      })}
    </svg>
  );
}
