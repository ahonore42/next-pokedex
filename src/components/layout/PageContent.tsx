import type { ReactNode } from 'react';

type PageContentProps = {
  children: ReactNode;
  className?: string;
};

export default function PageContent({ children, className }: PageContentProps) {
  return <div className={`flex flex-col mt-4 gap-4 ${className}`}>{children}</div>;
}
