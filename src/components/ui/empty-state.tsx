import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, message, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-8 ${className}`}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 text-muted-foreground/60">
        {icon ?? <Inbox size={28} strokeWidth={1.5} />}
      </div>
      <p className="text-[15px] text-muted-foreground text-center">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
