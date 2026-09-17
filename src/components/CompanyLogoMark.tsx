import { logoSpecFor } from "../utils/logo";

export function CompanyLogoMark({
  name,
  colors,
  size = 40,
  radius = 12,
}: {
  name: string;
  colors: { name: string; hex: string }[];
  size?: number;
  radius?: number;
}) {
  const { initials, background, foreground } = logoSpecFor(name, colors);
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label={`${name} logo`}>
      <rect x="0" y="0" width="40" height="40" rx={radius} fill={background} />
      <text
        x="20"
        y="21"
        textAnchor="middle"
        dominantBaseline="central"
        fill={foreground}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="600"
        fontSize="16"
      >
        {initials}
      </text>
    </svg>
  );
}
