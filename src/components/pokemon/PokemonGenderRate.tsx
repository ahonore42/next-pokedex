import type { PokemonSpecies } from '~/server/routers/_app';
import { formatGenderRate } from '~/utils/pokemon';
import SectionCard from '../ui/SectionCard';
import InfoField from '../ui/InfoField';

interface PokemonGenderRateProps {
  genderRate: PokemonSpecies['genderRate'];
  className?: string;
}

export default function PokemonGenderRate({ genderRate, className }: PokemonGenderRateProps) {
  const [male, female, genderless] = formatGenderRate(genderRate);
  const genderRateInfo = genderless ? (
    <span className="whitespace-nowrap">{genderless.value}</span>
  ) : (
    <span className="flex items-center gap-2">
      <span className="whitespace-nowrap">
        <span className="text-blue-600 border-blue-300">{male.symbol}</span>
        {male.value}
      </span>
      <span className="whitespace-nowrap">
        <span className="text-red-500 border-red-300">{female.symbol}</span>
        {female.value}
      </span>
    </span>
  );

  return (
    <SectionCard title="Gender Ratio" variant="compact" className={className}>
      <InfoField primary={genderRateInfo} className='pb-5' />
    </SectionCard>
  );
}
