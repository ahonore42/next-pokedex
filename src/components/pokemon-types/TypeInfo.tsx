import SectionCard from '../ui/SectionCard';
import TypeBadgesDisplay from './TypeBadgesDisplay';
import { AllTypesOutput } from '~/server/routers/_app';

interface TypeInfoProps {
  types: AllTypesOutput;
}

export default function TypeInfo({ types }: TypeInfoProps) {
  // Find all needed types at once
  const typeMap = new Map(types.map((type) => [type.name, type]));
  const water = typeMap.get('water')!;
  const fire = typeMap.get('fire')!;
  const electric = typeMap.get('electric')!;
  const grass = typeMap.get('grass')!;
  const ground = typeMap.get('ground')!;
  const rock = typeMap.get('rock')!;

  // Effectiveness examples with consistent colors matching TypeEffectivenessKey and pre-mapped types
  const examplesWithTypes = [
    {
      multiplier: '4×',
      label: 'Quadruple Damage',
      description: 'Double-type advantage stacks for maximum damage',
      color: 'bg-green-700 text-white',
      attackingType: water,
      defendingTypes: [ground, rock],
    },
    {
      multiplier: '2×',
      label: 'Super Effective',
      description: 'Single-type advantage deals double damage',
      color: 'bg-green-500 text-white',
      attackingType: water,
      defendingTypes: [fire],
    },
    {
      multiplier: '1×',
      label: 'Normal Damage',
      description: 'Standard effectiveness with no advantage',
      color: 'dark:bg-gray-500 bg-gray-100',
      attackingType: water,
      defendingTypes: [electric],
    },
    {
      multiplier: '0.5×',
      label: 'Not Very Effective',
      description: 'Type disadvantage deals half damage',
      color: 'bg-red-500 text-white',
      attackingType: water,
      defendingTypes: [grass],
    },
    {
      multiplier: '0×',
      label: 'No Effect',
      description: 'Complete immunity to certain attacks',
      color: 'bg-gray-900 text-white',
      attackingType: electric,
      defendingTypes: [ground],
    },
  ];

  return (
    <>
      <div className="space-y-8 mb-8">
        {/* Introduction */}
        <div className="lg:grid grid-cols-2">
          <SectionCard title="About Pokémon Types" colorVariant="transparent">
            <div className="text-lg max-w-none space-y-4 text-primary leading-relaxed">
              <p className="">
                All Pokémon species and their moves are assigned certain types. Each type has
                several strengths and weaknesses in both attack and defense. In battle, you should
                use Pokémon and moves that have a type advantage over your opponent. Doing so will
                cause much more damage than normal.
              </p>
              <p>
                A single-type advantage (for instance a Water attack against a Ground-type Pokémon)
                will net you double normal damage. The advantages also stack up, so a double-type
                advantage (for instance a Water attack against a Ground/Rock-type Pokémon) will net
                you quadruple damage. In both these cases you will see the message{' '}
                <span className="font-bold">"It's super effective!"</span> in-game after the attack.
              </p>
              <p>
                Conversely, a single- and double-type disadvantage will afflict half and a quarter
                normal damage respectively. Here you will see the message{' '}
                <span className="font-bold">"It's not very effective..."</span> in-game.
              </p>
            </div>
          </SectionCard>

          {/* Type Effectiveness Grid */}
          <SectionCard title="Type Effectiveness" colorVariant="transparent">
            {/* <h4 className="text-lg font-semibold text-primary mb-4">Type Effectiveness</h4> */}

            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3 mb-6">
              {examplesWithTypes.map((item) => (
                <div key={item.multiplier} className="group">
                  <div className="surface hover:surface-hover card interactive-link h-full transition-interactive ">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm ${item.color}`}
                      >
                        {item.multiplier}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-semibold text-primary text-sm leading-tight">
                          {item.label}
                        </h5>
                      </div>
                    </div>

                    <p className="text-muted text-sm leading-relaxed mb-3">{item.description}</p>

                    {/* Type Badge Examples */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-sm">
                        <TypeBadgesDisplay types={[{ type: item.attackingType }]} link={false} />
                        <span className="text-subtle mx-1">vs</span>
                        <TypeBadgesDisplay
                          types={item.defendingTypes.map((type) => ({ type }))}
                          link={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* STAB Section */}
        <SectionCard title="Same Type Attack Bonus (STAB)">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-lg text-primary leading-relaxed">
                Another advantage you can gain is Same Type Attack Bonus (STAB). As the name
                implies, this increases the power of the move if the attacking Pokémon has the same
                type as the move used (for example a Fire-type Pokémon using a Fire-type move). In
                this case the damage is 1.5 times normal.
              </p>
            </div>

            <SectionCard
              title="Maximum Damage Calculation"
              variant="compact"
              colorVariant="pokemon"
              className="interactive-link transition-interactive"
            >
              <div className="text-sm text-muted space-y-2">
                <div className="flex justify-between items-center">
                  <span>Type advantage:</span>
                  <span className="font-mono text-primary">4× (quadruple)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>STAB bonus:</span>
                  <span className="font-mono text-primary">1.5×</span>
                </div>
                <div className="border-t border-pokemon-border pt-2 mt-3">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-primary">Total damage:</span>
                    <span className="font-mono text-green-700 dark:text-green-400 text-lg">
                      6× damage!
                    </span>
                  </div>
                </div>
                <div className="text-sx text-subtle italic mt-2 flex flex-wrap items-center justify-center gap-1">
                  <span>Example:</span>
                  <TypeBadgesDisplay types={[{ type: water }]} link={false} />
                  <span>Pokémon using a</span>
                  <TypeBadgesDisplay types={[{ type: water }]} link={false} />
                  <span>move vs</span>
                  <TypeBadgesDisplay types={[{ type: ground }, { type: rock }]} link={false} />
                </div>
              </div>
            </SectionCard>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
