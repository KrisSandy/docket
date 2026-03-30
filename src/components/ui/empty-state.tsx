interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, message, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-8 ${className}`}>
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <p className="text-[15px] text-muted-foreground text-center">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
