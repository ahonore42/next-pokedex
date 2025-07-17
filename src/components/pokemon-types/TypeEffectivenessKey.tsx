import { getDamageFactorColor } from '~/utils/pokemon';
import SectionCard from '../ui/SectionCard';

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
    <div className="flex flex-col md:flex-row lg:flex-col gap-4">
      <SectionCard title="Chart Key" variant="compact" className="w-64 lg:w-56 xl:w-64">
        <div className="flex flex-col gap-3">
          {keyItems.map((item) => (
            <div key={item.factor} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded text-xs font-bold flex items-center justify-center shadow-md ${item.color}`}
              />
              <div className="text-sm">
                <div className="font-medium text-primary">{item.label}</div>
                <div className="text-xs text-muted">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Usage"
        variant="compact"
        className="lg:w-56 xl:w-64 md:flex-1 lg:flex-none"
      >
        <p className="text-muted mb-2 text-wrap">
          The full type chart here displays the strengths and weaknesses of each type. Look down the
          left hand side for the attacking type, then move across to see how effective it is against
          each Pokémon type.
        </p>
        <div className="mt-3 text-xs text-muted">
          <p>
            Read the chart: <strong>Attacking type (rows)</strong> vs{' '}
            <strong>Defending type (columns)</strong>
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
