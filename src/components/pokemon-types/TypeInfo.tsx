import SectionCard from '../ui/SectionCard';

export default function TypeInfo() {
  return (
    <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
      <SectionCard title="About Pokémon Types">
        <div className="text-md leading-relaxed space-y-5 text-wrap">
          <p className="text-primary text-wrap">
            All Pokémon creatures and their moves are assigned certain types. Each type has several
            strengths and weaknesses in both attack and defense. In battle, you should use Pokémon
            and moves that have a type advantage over your opponent; doing so will cause much more
            damage than normal.
          </p>

          <div>
            <h4 className="font-semibold text-primary mb-3">Type Effectiveness</h4>
            <p className="mb-3 text-muted text-wrap">
              A single-type advantage (for instance a Water attack against a Ground-type Pokémon)
              will net you double normal damage. The advantages also stack up, so a double-type
              advantage (for instance a Water attack against a Ground/Rock-type Pokémon) will net
              you quadruple damage. In both these cases you will see the message "It's super
              effective!" in-game after the attack.
            </p>
            <p className="mb-3 text-muted text-wrap">
              Conversely, a single- and double-type disadvantage will afflict half and a quarter
              normal damage respectively. Here you will see the message "It's not very effective..."
              in-game.
            </p>
            <ul className="space-y-2 text-muted ml-4">
              <li>
                • <strong className="text-green-600">Super Effective (2×):</strong> Single-type
                advantage deals double damage
              </li>
              <li>
                • <strong className="text-green-700">Quadruple Damage (4×):</strong> Double-type
                advantage stacks for four times normal damage
              </li>
              <li>
                • <strong className="text-red-600">Not Very Effective (0.5×):</strong> Type
                disadvantage deals half damage
              </li>
              <li>
                • <strong className="text-gray-600">No Effect (0×):</strong> Some types are
                completely immune to certain attacks
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary mb-3">Same Type Attack Bonus (STAB)</h4>
            <p className="mb-3 text-muted text-wrap">
              Another advantage you can gain is Same Type Attack Bonus (STAB). As the name implies,
              this increases the power of the move if the attacking Pokémon has the same type as the
              move used (for example a Fire-type Pokémon using a Fire-type move). In this case the
              damage is 1.5 times normal.
            </p>
            <p className="text-muted text-wrap">
              Again this is added to any other advantages, so a Water-type Pokémon using a
              Water-type move against a Ground/Rock-type Pokémon will bag you{' '}
              <strong className="text-green-700">six times (2×2×1.5) normal damage!</strong>
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
