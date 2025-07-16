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
    { factor: 0, color: getDamageFactorColor(0), label: 'No Effect', description: '0 damage' },
  ];

  return (
    <div className="w-64 lg:w-56 xl:w-64">
      <div className="p-4 bg-surface-elevated rounded-lg border border-border">
        <h3 className="text-sm font-semibold text-primary mb-3">Chart Key</h3>
        <div className="flex flex-col gap-3">
          {keyItems.map((item) => (
            <div key={item.factor} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded text-xs font-bold flex items-center justify-center ${item.color}`}
              />
              <div className="text-sm">
                <div className="font-medium text-primary">{item.label}</div>
                <div className="text-xs text-muted">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-muted">
          <p>
            Read the chart: <strong>Attacking type (rows)</strong> vs{' '}
            <strong>Defending type (columns)</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
