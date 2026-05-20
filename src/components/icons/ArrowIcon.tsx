type Props = { className?: string };

export function ArrowIcon({ className = "arrow" }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ExternalIcon() {
  return (
    <svg className="go" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}
