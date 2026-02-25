'use client';

interface LevelToggleProps {
  value: 50 | 100;
  onChange: (level: 50 | 100) => void;
}

export default function LevelToggle({ value, onChange }: LevelToggleProps) {
  return (
    <div className="flex rounded-md border border-border overflow-hidden text-xs font-medium">
      {([50, 100] as const).map((lv) => (
        <button
          key={lv}
          onClick={() => onChange(lv)}
          className={[
            'px-2.5 py-1 transition-colors',
            value === lv
              ? 'bg-indigo-600 text-white'
              : 'bg-surface text-subtle hover:bg-hover',
          ].join(' ')}
        >
          Lv.{lv}
        </button>
      ))}
    </div>
  );
}
