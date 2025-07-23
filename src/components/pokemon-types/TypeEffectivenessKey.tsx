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
    {
      factor: 0,
      color: getDamageFactorColor(0),
      label: 'No Effect',
      description: '0 damage',
    },
  ];

  return (
    <div className="hidden md:flex flex-col md:flex-row lg:flex-col gap-4">
      <SectionCard title="Chart Key" variant="compact" className="sm:flex-1 lg:w-64">
        <div className="space-y-3">
          {keyItems.map((item) => (
            <div
              key={item.factor}
              className="group surface-hover rounded-lg p-3 transition-interactive hover:-translate-y-0.5 hover:shadow-md border border-border"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg text-sm font-bold flex items-center justify-center transition-theme group-hover:scale-110 ${item.color}`}
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  {item.factor === 0.5 ? '½' : item.factor || '0'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-primary text-sm">
                    {item.label}
                  </div>
                  <div className="text-xs text-muted group-hover:text-primary transition-theme">
                    {item.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Usage" variant="compact" className="lg:w-64 sm:flex-1 ">
        <div className="space-y-4">
          <p className="text-muted leading-relaxed text-sm">
            The full type chart here displays the strengths and weaknesses of each type. Look down
            the left hand side for the attacking type, then move across to see how effective it is
            against each Pokémon type.
          </p>

          <div className="surface rounded-lg p-3 border border-border">
            <div className="text-xs text-muted space-y-1">
              <div className="flex items-center justify-between">
                <span>Read the chart:</span>
              </div>
              <div className="text-primary">
                <strong>Attacking type</strong> (rows) vs <strong>Defending type</strong> (columns)
              </div>
            </div>
          </div>

          <div className="text-xs text-subtle italic">
            Hover over chart cells for detailed effectiveness information
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
