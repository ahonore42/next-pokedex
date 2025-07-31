import SectionCard from '../ui/SectionCard';
import TypeBadgesDisplay from './TypeBadgesDisplay';

export default function SameTypeAttackBoost() {
  return (
    <SectionCard
      variant="compact"
      colorVariant="transparent"
      title="Same Type Attack Bonus (STAB)"
      className="xl:min-h-88"
    >
      <div className="grid grid-cols-1 gap-4">
        <div className="min-h-16 lg:min-h-12 xl:min-h-24">
          <p className="text-primary">
            Another advantage you can gain is Same Type Attack Bonus (STAB). As the name implies,
            this increases the power of the move if the attacking Pokémon has the same type as the
            move used (for example a Fire-type Pokémon using a Fire-type move). In this case the
            damage is 1.5 times normal.
          </p>
        </div>

        <SectionCard
          title="Maximum Damage Calculation"
          variant="compact"
          colorVariant="pokemon"
          className="interactive-link transition-interactive min-h-40"
        >
          <div className="text-sm text-muted">
            <div>
              <div className="flex justify-between items-center">
                <span>Type advantage:</span>
                <span className="font-mono text-primary">4× (quadruple)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>STAB bonus:</span>
                <span className="font-mono text-primary">1.5×</span>
              </div>
              <div className="border-t border-pokemon-border">
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-primary">Total damage:</span>
                  <span className="font-mono text-green-700 dark:text-green-400 text-md">
                    6× damage!
                  </span>
                </div>
              </div>
            </div>

            <div className="text-subtle italic flex flex-wrap items-center justify-center gap-1">
              <span>Example:</span>
              <TypeBadgesDisplay types={['water']} link={false} />
              <span>Pokémon using a</span>
              <TypeBadgesDisplay types={['water']} link={false} />
              <span>move vs</span>
              <TypeBadgesDisplay types={['ground', 'rock']} link={false} />
            </div>
          </div>
        </SectionCard>
      </div>
    </SectionCard>
  );
}
