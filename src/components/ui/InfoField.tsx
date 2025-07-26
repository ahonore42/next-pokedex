import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface InfoFieldProps {
  primary: ReactNode;
  secondary?: ReactNode;
  header?: ReactNode;
  className?: string;
}

export default function InfoField({ primary, secondary, header, className }: InfoFieldProps) {
  return (
    <div className={clsx(className)}>
      {header && (
        <h3 className="text-md text-primary font-semibold mb-2 whitespace-nowrap">{header}</h3>
      )}
      <p className="text-md text-primary font-medium">{primary}</p>
      {secondary && <p className="text-sm text-muted">{secondary}</p>}
    </div>
  );
}

// Display name for debugging
InfoField.displayName = 'InfoField';
