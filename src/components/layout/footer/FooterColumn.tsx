// FooterColumn.tsx
import { type FooterLink } from './footer.types';

interface FooterColumnProps {
  title: string;
  links: FooterLink[];
}

export default function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="w-36 h-36 flex flex-col items-center justify-start mx-auto">
      <div>
        <h3 className="font-semibold text-primary text-sm leading-5">{title}</h3>
        <ul className="mt-2 space-y-2 text-sm text-muted">
          {links.map((link) => (
            <li key={link.href} className="h-5">
              <a href={link.href} className="leading-5 hover:text-brand block">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
