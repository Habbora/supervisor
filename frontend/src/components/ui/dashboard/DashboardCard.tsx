export interface DashboardCardProps {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  color?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function DashboardCard({ title, description, icon, color, className, children }: DashboardCardProps) {
  return (
    <div className={`rounded-lg shadow-md p-4 ${className}`} style={{ 
      boxShadow: '0 4px 6px var(--color-shadow)',
      backgroundColor: color || 'var(--color-background-light)',
      color: 'var(--color-text-primary)'
    }}>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      {children && children}
    </div>
  );
}


