import { useState } from 'react';
import { AllEfficaciesOutput, AllTypesOutput } from '~/server/routers/_app';
import { buildTypeEfficacyMap, getTypeEfficacy } from '~/utils/pokemon';
import TypeBadge from '~/components/pokemon-types/TypeBadge';

interface MobileTypeChartProps {
  types: AllTypesOutput; // TODO: Replace any with actual type
  efficacies: AllEfficaciesOutput;
}

export default function MobileTypeChart({ types, efficacies }: MobileTypeChartProps) {
  const [selectedAttackingType, setSelectedAttackingType] = useState<string>('normal'); // Default to Normal type (id 1)
  const efficacyMap = buildTypeEfficacyMap(efficacies);
  return (
    <div className="h-96 flex flex-col gap-4">
      <div>
        <label
          htmlFor="attacking-type-select"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Select Attacking Type:
        </label>
        <select
          id="attacking-type-select"
          className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-full"
          value={selectedAttackingType ?? ''}
          onChange={(e) => setSelectedAttackingType(e.target.value)}
        >
          <option value="" disabled>
            Select a Type
          </option>
          {types.map((type) => (
            <option key={type.id} value={type.name} className="capitalize">
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {selectedAttackingType && (
        <div className="space-y-4">
          {/* Super Effective */}
          <div>
            <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
              Super Effective Against (2x)
            </h3>
            <div className="flex flex-wrap gap-2">
              {types
                .filter(
                  (defendingType) =>
                    getTypeEfficacy(efficacyMap, selectedAttackingType, defendingType.name) > 1,
                )
                .map((defendingType) => (
                  <TypeBadge key={defendingType.id} type={defendingType.name} link={false} />
                ))}
            </div>
          </div>

          {/* Not Very Effective */}
          <div>
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              Not Very Effective Against (0.5x)
            </h3>
            <div className="flex flex-wrap gap-2">
              {types
                .filter(
                  (defendingType) =>
                    getTypeEfficacy(efficacyMap, selectedAttackingType, defendingType.name) < 1 &&
                    getTypeEfficacy(efficacyMap, selectedAttackingType, defendingType.name) !== 0,
                )
                .map((defendingType) => (
                  <TypeBadge key={defendingType.id} type={defendingType.name} link={false} />
                ))}
            </div>
          </div>

          {/* No Effect */}
          <div>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No Effect On (0x)
            </h3>
            <div className="flex flex-wrap gap-2">
              {types
                .filter(
                  (defendingType) =>
                    getTypeEfficacy(efficacyMap, selectedAttackingType, defendingType.name) === 0,
                )
                .map((defendingType) => (
                  <TypeBadge key={defendingType.id} type={defendingType.name} link={false} />
                ))}
            </div>
          </div>

          {/* Normal Effectiveness (1x) - Optional, can be omitted for brevity */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Normal Effectiveness (1x)
            </h3>
            <div className="flex flex-wrap gap-2">
              {types
                .filter(
                  (defendingType) =>
                    getTypeEfficacy(efficacyMap, selectedAttackingType, defendingType.name) === 1,
                )
                .map((defendingType) => (
                  <TypeBadge key={defendingType.id} type={defendingType.name} link={false} />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
