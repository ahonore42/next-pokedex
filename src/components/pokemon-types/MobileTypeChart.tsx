import { useState } from 'react';
import { AllTypesOutput } from '~/server/routers/_app';
import TypeBadge from '~/components/pokemon-types/TypeBadge';

interface MobileTypeChartProps {
  allTypes: AllTypesOutput; // TODO: Replace any with actual type
  getDamageFactor: (attackingTypeId: number, defendingTypeId: number) => number;
}

export default function MobileTypeChart({ allTypes, getDamageFactor }: MobileTypeChartProps) {
  const [selectedAttackingTypeId, setSelectedAttackingTypeId] = useState<number | null>(1); // Default to Normal type (id 1)

  return (
    <div>
      <div className="mb-4">
        <label
          htmlFor="attacking-type-select"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Select Attacking Type:
        </label>
        <select
          id="attacking-type-select"
          className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-full"
          value={selectedAttackingTypeId ?? ''}
          onChange={(e) => setSelectedAttackingTypeId(Number(e.target.value))}
        >
          <option value="" disabled>
            Select a Type
          </option>
          {allTypes.map((type) => (
            <option key={type.id} value={type.id} className="capitalize">
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {selectedAttackingTypeId && (
        <div className="space-y-4">
          {/* Super Effective */}
          <div>
            <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
              Super Effective Against (2x)
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTypes
                .filter(
                  (defendingType) => getDamageFactor(selectedAttackingTypeId, defendingType.id) > 1,
                )
                .map((defendingType) => (
                  <TypeBadge key={defendingType.id} type={defendingType} link={false} />
                ))}
            </div>
          </div>

          {/* Not Very Effective */}
          <div>
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              Not Very Effective Against (0.5x)
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTypes
                .filter(
                  (defendingType) =>
                    getDamageFactor(selectedAttackingTypeId, defendingType.id) < 1 &&
                    getDamageFactor(selectedAttackingTypeId, defendingType.id) !== 0,
                )
                .map((defendingType) => (
                  <TypeBadge key={defendingType.id} type={defendingType} link={false} />
                ))}
            </div>
          </div>

          {/* No Effect */}
          <div>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No Effect On (0x)
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTypes
                .filter(
                  (defendingType) =>
                    getDamageFactor(selectedAttackingTypeId, defendingType.id) === 0,
                )
                .map((defendingType) => (
                  <TypeBadge key={defendingType.id} type={defendingType} link={false} />
                ))}
            </div>
          </div>

          {/* Normal Effectiveness (1x) - Optional, can be omitted for brevity */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Normal Effectiveness (1x)
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTypes
                .filter(
                  (defendingType) =>
                    getDamageFactor(selectedAttackingTypeId, defendingType.id) === 1,
                )
                .map((defendingType) => (
                  <TypeBadge key={defendingType.id} type={defendingType} link={false} />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
