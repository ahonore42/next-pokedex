import { trpc } from '~/utils/trpc';
import LoadingPage from '~/components/ui/LoadingPage';
import SectionCard from '~/components/ui/SectionCard';
import { DesktopTypeChart } from './DesktopTypeChart';
import { MobileTypeChart } from './MobileTypeChart';
import { AllTypesOutput, AllEfficaciesOutput } from '~/server/routers/_app';

const TypeEffectivenessChart: React.FC = () => {
  const { data: allTypes, isLoading: isLoadingAllTypes } = trpc.types.allTypes.useQuery() as { data: AllTypesOutput, isLoading: boolean };
  const { data: allEfficacies, isLoading: isLoadingEfficacies } = trpc.types.getAllTypeEfficacies.useQuery() as { data: AllEfficaciesOutput, isLoading: boolean };

  if (isLoadingAllTypes || isLoadingEfficacies || !allTypes || !allEfficacies) {
    return <LoadingPage />;
  }

  const efficacyMap = new Map<number, Map<number, number>>();
  allEfficacies.forEach((efficacy) => {
    if (!efficacyMap.has(efficacy.damageType.id)) {
      efficacyMap.set(efficacy.damageType.id, new Map<number, number>());
    }
    efficacyMap.get(efficacy.damageType.id)?.set(efficacy.targetType.id, efficacy.damageFactor);
  });

  const getDamageFactor = (attackingTypeId: number, defendingTypeId: number) => {
    return efficacyMap.get(attackingTypeId)?.get(defendingTypeId) ?? 1; // Default to 1x if no specific efficacy found
  };

  const getDamageFactorText = (factor: number) => {
    if (factor === 0) return '0x';
    if (factor === 0.5) return '0.5x';
    if (factor === 1) return '1x';
    if (factor === 2) return '2x';
    return `${factor}x`;
  };

  const getDamageFactorColor = (factor: number) => {
    if (factor === 0) return 'bg-gray-500'; // No effect
    if (factor < 1) return 'bg-red-500'; // Not very effective
    if (factor > 1) return 'bg-green-500'; // Super effective
    return 'bg-gray-300 text-gray-800'; // Normal effect - Changed color and text color
  };

  return (
    <SectionCard title="Type Effectiveness Chart">
      {/* Desktop View (lg and above) */}
      <div className="hidden lg:block">
        <DesktopTypeChart
          allTypes={allTypes}
          getDamageFactor={getDamageFactor}
          getDamageFactorText={getDamageFactorText}
          getDamageFactorColor={getDamageFactorColor}
        />
      </div>

      {/* Hybrid View (below lg) */}
      <div className="lg:hidden">
        <MobileTypeChart
          allTypes={allTypes}
          getDamageFactor={getDamageFactor}
        />
      </div>
    </SectionCard>
  );
};

export default TypeEffectivenessChart;