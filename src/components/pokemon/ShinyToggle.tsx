import Button from '../ui/buttons/Button';

interface ShinyToggleProps {
  isShiny: boolean;
  setIsShiny: (isShiny: boolean) => void;
}

export default function ShinyToggle({ isShiny, setIsShiny }: ShinyToggleProps) {
  return (
    <div className="flex justify-center">
      <div className="flex bg-gray-200 dark:bg-gray-600 rounded-lg p-1">
        <Button
          onClick={() => setIsShiny(false)}
          variant={!isShiny ? 'primary' : 'ghost'}
          size="sm"
          className="text-nowrap border-0"
        >
          Normal
        </Button>
        <Button
          onClick={() => setIsShiny(true)}
          variant={isShiny ? 'primary' : 'ghost'}
          size="sm"
          className="text-nowrap border-0"
        >
          ✨ Shiny
        </Button>
      </div>
    </div>
  );
}
