import TableLink, { TableLinkProps } from './TableLink';

export interface TableLinksProps {
  links: TableLinkProps[];
  className?: string;
}

export default function TableLinks({ links, className = '' }: TableLinksProps) {
  return (
    <div className={`flex flex-col items-center gap-0.5 leading-none ${className}`}>
      {links.map((link, index) => (
        <TableLink
          key={`${link.label}_${index}`}
          href={link.href}
          src={link.src}
          label={link.label}
          className={link.className}
        />
      ))}
    </div>
  );
}

// Render Pokemon search results
export const renderTableLinks = ({ links, className }: TableLinksProps) => (
  <TableLinks links={links} className={className} />
);
