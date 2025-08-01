import TableLink, { TableLinkProps } from './TableLink';

export interface TableLinksProps {
  links: TableLinkProps[];
  className?: string;
}

export default function TableLinks({ links, className = '' }: TableLinksProps) {
  return (
    <div className={`flex flex-col items-center gap-0.5 ${className}`}>
      {links.map((link) => (
        <div>
          <TableLink
            href={link.href}
            src={link.src}
            label={link.label}
            className={link.className}
          />
        </div>
      ))}
    </div>
  );
}

// Render Pokemon search results
export const renderTableLinks = ({ links, className }: TableLinksProps) => (
  <TableLinks links={links} className={className} />
);
