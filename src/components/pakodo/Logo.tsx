export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="var(--primary)" />
      <rect x="25" y="12" width="14" height="24" rx="7" fill="var(--primary-foreground)" />
      <path d="M18 31a14 14 0 0 0 28 0" fill="none" stroke="var(--primary-foreground)" strokeWidth="4" strokeLinecap="round" />
      <path d="M32 45v7M24 52h16" stroke="var(--primary-foreground)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
