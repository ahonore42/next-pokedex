import { TypeBadge } from '~/components/ui/TypeBadge';

interface DesktopTypeChartProps {
  allTypes: any[]; // TODO: Replace any with actual type
  getDamageFactor: (attackingTypeId: number, defendingTypeId: number) => number;
  getDamageFactorText: (factor: number) => string;
  getDamageFactorColor: (factor: number) => string;
}

export const DesktopTypeChart: React.FC<DesktopTypeChartProps> = ({
  allTypes,
  getDamageFactor,
  getDamageFactorText,
  getDamageFactorColor,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="w-14 h-14 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Attacking \ Defending</th>
            {allTypes.map((defendingType) => (
              <th
                key={defendingType.id}
                className="w-14 h-14 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                <TypeBadge type={defendingType} link={false} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {allTypes.map((attackingType) => (
            <tr key={attackingType.id}>
              <td className="w-14 h-14 whitespace-nowrap">
                <TypeBadge type={attackingType} link={false} />
              </td>
              {allTypes.map((defendingType) => {
                const damageFactor = getDamageFactor(attackingType.id, defendingType.id);
                return (
                  <td key={defendingType.id} className="w-14 h-14 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center justify-center w-12 h-8 rounded-full text-sm font-bold ${getDamageFactorColor(damageFactor)}`}>
                      {getDamageFactorText(damageFactor)}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
