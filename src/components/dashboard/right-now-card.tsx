import { DotTimeline, type DotTimelineItem } from './dot-timeline';

interface RightNowCardProps {
  attentionCount: number;
  items: DotTimelineItem[];
}

/** The Overview screen's hero card: how many things need attention right now,
 * plotted across a 90-day timeline so the shape of the year ahead is visible. */
export function RightNowCard({ attentionCount, items }: RightNowCardProps) {
  return (
    <div className="rounded-xl bg-card p-5.5 shadow-md">
      <span className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
        Right now
      </span>
      <div className="mt-2.5 flex items-end gap-3">
        <span className="font-heading text-[76px] leading-[0.82] font-bold tracking-tight text-primary">
          {attentionCount}
        </span>
        <span className="pb-1.5 font-heading text-[22px] leading-[1.1] font-semibold tracking-tight">
          {attentionCount === 1 ? 'thing needs' : 'things need'}
          <br />
          your attention
        </span>
      </div>
      <DotTimeline items={items} />
    </div>
  );
}
