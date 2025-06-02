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
      className={`surface-elevated border-theme rounded-lg p-6 transition-all duration-300 hover:shadow-lg ${className}`}
      style={{
        backgroundColor: "var(--color-surface-elevated)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
        {tag && (
          <span
            className="text-sm text-tertiary px-2 py-1 rounded transition-colors duration-300"
            style={{
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-tertiary)",
            }}
          >
            {tag}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
