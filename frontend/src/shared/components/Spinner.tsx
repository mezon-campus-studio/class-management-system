interface SpinnerProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

import type React from 'react';

export function Spinner({ size = 20, className = '', style }: SpinnerProps) {
  return (
    <span
      className={`inline-block rounded-full border-2 border-current border-t-transparent animate-spin ${className}`}
      style={{ width: size, height: size, ...style }}
    />
  );
}
