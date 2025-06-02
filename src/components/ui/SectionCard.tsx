import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  title: string;
  tag?: string;
  className?: string;
}

export default function SectionCard({
  children,
  title,
  tag = "",
  className = "",
}: ContainerProps) {
  return (
    <div
      className={`border rounded-lg p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
        {tag && (
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {tag}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
