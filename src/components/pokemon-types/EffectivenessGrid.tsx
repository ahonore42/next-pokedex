import { getDamageFactorColor } from '~/utils/pokemon';
import SectionCard from '../ui/SectionCard';
import TypeBadgesDisplay from './TypeBadgesDisplay';
import { useMemo } from 'react';

export default function EffectivenessGrid() {
  // Effectiveness examples with consistent colors matching TypeEffectivenessKey and pre-mapped types
  const examplesWithTypes = useMemo(
    () => [
      {
        multiplier: '4',
        label: 'Quadruple Damage',
        description: 'Double-type advantage stacks for maximum damage',
        color: getDamageFactorColor(4),
        attackingType: 'water',
        defendingTypes: ['ground', 'rock'],
      },
      {
        multiplier: '2',
        label: 'Super Effective',
        description: 'Single-type advantage deals double damage',
        color: getDamageFactorColor(2),
        attackingType: 'water',
        defendingTypes: ['fire'],
      },
      {
        multiplier: '1',
        label: 'Normal Damage',
        description: 'Standard effectiveness with no advantage',
        color: getDamageFactorColor(1),
        attackingType: 'water',
        defendingTypes: ['electric'],
      },
      {
        multiplier: '½',
        label: 'Not Very Effective',
        description: 'Type disadvantage deals half damage',
        color: getDamageFactorColor(0.5),
        attackingType: 'water',
        defendingTypes: ['grass'],
      },
      {
        multiplier: '0',
        label: 'No Effect',
        description: 'Complete immunity to certain attacks',
        color: getDamageFactorColor(0),
        attackingType: 'electric',
        defendingTypes: ['ground'],
      },
    ],
    [],
  );

  return (
    <SectionCard title="Type Effectiveness" variant="compact" colorVariant="transparent">
      <div className="grid min-h-156 sm:min-h-92 lg:min-h-60 xl:min-h-28 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {examplesWithTypes.map((item) => (
          <div key={item.multiplier} className="group">
            <div className="flex flex-col justify-between surface hover:surface-hover rounded-lg p-2 interactive-link h-28 transition-interactive">
              <div className="flex items-center gap-4">
                <div
                  className={`size-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm ${item.color}`}
                >
                  {item.multiplier}
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="font-semibold text-primary text-md tracking-tight">
                    {item.label}
                  </h5>
                </div>
              </div>

              <p className="text-muted text-sm leading-4">{item.description}</p>

              {/* Type Badge Examples */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-sm">
                  <TypeBadgesDisplay types={[item.attackingType]} link={false} />
                  <span className="text-subtle mx-0.5">vs</span>
                  <TypeBadgesDisplay types={item.defendingTypes} link={false} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
