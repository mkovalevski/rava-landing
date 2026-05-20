const baseProps = {
  viewBox: "0 0 24 24",
  width: 22,
  height: 22,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function MissionPlusIcon() {
  return (
    <svg {...baseProps}>
      <path d="M12 3v18M3 12h18" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export function MissionListIcon() {
  return (
    <svg {...baseProps}>
      <path d="M3 7h18M3 12h18M3 17h12" />
    </svg>
  );
}

export function MissionBookIcon() {
  return (
    <svg {...baseProps}>
      <path d="M4 19V5l8 4 8-4v14l-8-4-8 4z" />
    </svg>
  );
}

export function MissionPeopleIcon() {
  return (
    <svg {...baseProps}>
      <circle cx="9" cy="8" r="3.5" />
      <circle cx="17" cy="10" r="2.8" />
      <path d="M3 20c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5M13 20c0-2.1 1.8-3.8 4-3.8s4 1.7 4 3.8" />
    </svg>
  );
}

export function MissionPinIcon() {
  return (
    <svg {...baseProps}>
      <path d="M12 22s-7-4.5-7-12a7 7 0 0 1 14 0c0 7.5-7 12-7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function MissionPulseIcon() {
  return (
    <svg {...baseProps}>
      <path d="M3 12h4l2-6 4 12 2-6h6" />
    </svg>
  );
}
