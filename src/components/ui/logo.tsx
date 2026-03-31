/**
 * HomeDocket Logo — Minimal house + shield mark.
 *
 * Inline SVG so it respects currentColor and works in both themes
 * without needing separate asset files for light/dark.
 */

interface LogoIconProps {
  /** Width & height in pixels. Default 32. */
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 32, className }: LogoIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      {/* Shield */}
      <path
        d="M32 6L8 18v16c0 14 9.5 27 24 30 14.5-3 24-16 24-30V18L32 6z"
        fill="currentColor"
        fillOpacity="0.10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* House */}
      <g
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M19 36l13-11 13 11" />
        <path d="M22 34.5v12h20v-12" />
        <rect x="28" y="40" width="8" height="6.5" rx="1" />
      </g>
    </svg>
  );
}

interface LogoWordmarkProps {
  /** Icon size in pixels. Default 28. */
  iconSize?: number;
  className?: string;
}

export function LogoWordmark({ iconSize = 28, className }: LogoWordmarkProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ''}`}>
      <LogoIcon size={iconSize} className="text-primary" />
      <span className="text-[20px] font-bold tracking-tight text-foreground">
        HomeDocket
      </span>
    </div>
  );
}
