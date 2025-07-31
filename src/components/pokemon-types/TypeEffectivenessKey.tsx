import { getDamageFactorColor } from '~/utils/pokemon';

// Type Effectiveness Chart key/legend
export default function TypeEffectivenessKey() {
  const keyItems = [
    {
      factor: 2,
      color: getDamageFactorColor(2),
      label: 'Super Effective',
      description: '200% damage',
    },
    {
      factor: 1,
      color: getDamageFactorColor(1),
      label: 'Normal Damage',
      description: '100% damage',
    },
    {
      factor: 0.5,
      color: getDamageFactorColor(0.5),
      label: 'Not Very Effective',
      description: '50% damage',
    },
    {
      factor: 0,
      color: getDamageFactorColor(0),
      label: 'No Effect',
      description: '0 damage',
    },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-1 items-center justify-center gap-2 xl:gap-8 h-32 lg:h-14 xl:h-80">
      {keyItems.map((item) => (
        <div
          key={item.factor}
          className="group surface-hover rounded-lg p-2 w-48 h-14 transition-interactive hover:-translate-y-0.5 hover:shadow-md border border-border"
        >
          <div className="flex lg:items-center sm:items-start gap-2">
            <div
              className={`size-8 rounded-lg text-sm font-bold flex items-center justify-center transition-theme group-hover:scale-110 ${item.color}`}
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              {item.factor === 0.5 ? '½' : item.factor || '0'}
            </div>
            <div className="">
              <div className="font-semibold text-primary text-sm">{item.label}</div>
              <div className="text-xs text-muted group-hover:text-primary transition-theme">
                {item.description}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
