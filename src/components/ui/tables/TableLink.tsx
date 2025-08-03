import Link from 'next/link';
import Sprite from '../Sprite';

export interface TableLinkProps {
  href: string;
  label: string;
  src?: string;
  className?: string;
}

export default function TableLink({ href, src, label, className = '' }: TableLinkProps) {
  const formattedLabel = label.replaceAll('-', ' ');
  return (
    <Link
      href={href}
      className={`flex items-center justify-start gap-1 ${src ? 'hover:bg-surface hover:rounded-lg active:bg-surface-elevated active:text-brand' : 'hover:text-brand'} ${className}`}
    >
      {src && <Sprite src={src} alt={label} variant="xs" />}
      <span className="capitalize font-medium">{formattedLabel}</span>
    </Link>
  );
}

// Render Pokemon search results
export const renderTableLink = ({ href, src, label, className }: TableLinkProps) => (
  <TableLink href={href} src={src} label={label} className={className} />
);
