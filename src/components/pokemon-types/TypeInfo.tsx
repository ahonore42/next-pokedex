import SectionCard from '../ui/SectionCard';

export default function TypeInfo() {
  return (
    <SectionCard
      title="About Pokémon Types"
      colorVariant="transparent"
      className="min-h-104 sm:min-h-80 md:min-h-72 lg:min-h-64 xl:min-h-80"
    >
      <div className="text-md text-primary space-y-2">
        <p>
          All Pokémon species and moves are assigned certain types. Each type has several strengths
          and weaknesses in both attack and defense. In battle, you should use Pokémon and moves
          that have a type advantage over your opponent. Doing so will cause much more damage than
          normal.
        </p>
        <p>
          A single-type advantage (for instance a Water attack against a Ground-type Pokémon) will
          net you double normal damage. The advantages also stack up, so a double-type advantage
          (for instance a Water attack against a Ground/Rock-type Pokémon) will net you quadruple
          damage. In both these cases you will see the message{' '}
          <span className="font-bold">"It's super effective!"</span> in-game after the attack.
        </p>
        <p>
          Conversely, a single- and double-type disadvantage will afflict half and a quarter normal
          damage respectively. Here you will see the message{' '}
          <span className="font-bold">"It's not very effective..."</span> in-game.
        </p>
      </div>
    </SectionCard>
  );
}
