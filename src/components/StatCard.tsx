import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  onClick?: () => void;
}

export function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, onClick }: Props) {
  return (
    <div
      className={`stat-card ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-primary/30 hover:shadow-lg transition-all' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${changeType === 'positive' ? 'text-success' : changeType === 'negative' ? 'text-destructive' : 'text-muted-foreground'}`}>
              {change}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      {onClick && <p className="text-[10px] text-muted-foreground mt-2">Click to view details</p>}
    </div>
  );
}
