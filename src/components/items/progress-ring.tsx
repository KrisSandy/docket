const WINDOW_DAYS = 90;

interface ProgressRingProps {
  /** Days until the deadline. Negative means overdue. */
  daysRemaining: number;
  /** Ring + inner circle color (any CSS color, typically a status token). */
  color: string;
  /** Track color behind the filled arc. */
  trackColor: string;
  /** Fill color of the inner circle. */
  innerColor: string;
  size?: number;
  innerSize?: number;
  children: React.ReactNode;
}

/** A conic-gradient countdown ring: the filled arc is the days remaining as a
 * fraction of a 90-day window (matching the dashboard's dot timeline window) —
 * full and green when there's plenty of time, draining toward empty as the
 * deadline nears, fully drained (and red) once it's overdue. */
export function ProgressRing({
  daysRemaining,
  color,
  trackColor,
  innerColor,
  size = 104,
  innerSize = 82,
  children,
}: ProgressRingProps) {
  const percent = Math.min(Math.max((daysRemaining / WINDOW_DAYS) * 100, 0), 100);

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} 0 ${percent}%, ${trackColor} ${percent}% 100%)`,
      }}
    >
      <div
        className="flex flex-col items-center justify-center rounded-full"
        style={{ width: innerSize, height: innerSize, background: innerColor }}
      >
        {children}
      </div>
    </div>
  );
}
