type BadgeVariant = 'blue' | 'green' | 'amber' | 'red' | 'sage' | 'warm';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
}

export function Badge({ variant = 'blue', children, dot = false }: BadgeProps) {
  return (
    <span className={`pill pill-${variant}`}>
      {dot && <span className="pill-dot" />}
      {children}
    </span>
  );
}
