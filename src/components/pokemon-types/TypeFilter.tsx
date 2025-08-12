import TypesDisplay from '~/components/pokemon-types/TypesDisplay';

interface TypeFilterProps {
  selectedType?: string | null;
  onTypeChange: (type: string | null) => void;
  showAllOption?: boolean;
  className?: string;
}

export default function TypeFilter({
  selectedType = null,
  onTypeChange,
  showAllOption = true,
  className,
}: TypeFilterProps) {
  return (
    <div className={className}>
      <TypesDisplay
        onClick={onTypeChange}
        selectedType={selectedType}
        allTypes={showAllOption}
        link={false}
      />
    </div>
  );
}
