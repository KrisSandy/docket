/**
 * HomeDocket in-app mark — a 24-radius ring with one segment burned off in
 * the brand color and a solid dot at the centre, matching the Hearth design
 * direction. Used only inside the app shell (dashboard header, lock screen)
 * — the marketing site keeps its own full "HomeDocket" branding.
 */

interface LogoIconProps {
  /** Icon size in pixels (square). Default 22. */
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 22, className }: LogoIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      className={`shrink-0 ${className ?? ''}`}
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="24" className="stroke-logo-track" strokeWidth="9" />
      <path
        d="M32 8a24 24 0 0 1 20.78 12"
        className="stroke-primary"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="7" className="fill-primary" />
    </svg>
  );
}

interface LogoWordmarkProps {
  /** Icon size in pixels. Default 22. */
  iconSize?: number;
  className?: string;
}

export function LogoWordmark({ iconSize = 22, className }: LogoWordmarkProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <LogoIcon size={iconSize} />
      <span className="font-heading text-[21px] font-bold tracking-tight text-foreground">
        docket
      </span>
    </div>
  );
}
