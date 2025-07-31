import type { ReactNode } from 'react';

type PageContentProps = {
  children: ReactNode;
};

export default function PageContent({ children }: PageContentProps) {
  return <div className="flex flex-col gap-4">{children}</div>;
}
