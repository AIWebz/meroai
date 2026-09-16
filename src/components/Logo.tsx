export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="9" fill="var(--color-ink)" />
      <path d="M9 22V10.6C9 10.3 9.2 10.2 9.4 10.3L16 15.1L22.6 10.3C22.8 10.2 23 10.3 23 10.6V22" stroke="var(--color-paper)" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function Logo({ size = 28, withWordmark = true }: { size?: number; withWordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      {withWordmark && <span className="font-display text-[19px] font-semibold tracking-tight text-ink">mero</span>}
    </span>
  );
}
