interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, action, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between px-4 py-2 ${className}`}>
      <h2 className="text-[18px] font-semibold tracking-normal">{title}</h2>
      {action}
    </div>
  );
}
