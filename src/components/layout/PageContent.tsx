import type { ReactNode } from 'react';

type PageContentProps = {
  children: ReactNode;
  className?: string;
};

export default function PageContent({ children, className }: PageContentProps) {
  return <div className={`flex flex-col gap-4 ${className}`}>{children}</div>;
}
