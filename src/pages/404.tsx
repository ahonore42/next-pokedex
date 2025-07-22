import Link from 'next/link';
import Pokeball from '~/components/ui/Pokeball';
import PhantomPokemon from '~/components/pokemon/PhantomPokemon';

export default function Custom404() {
  return (
    <>
      <PhantomPokemon />

      <div className="flex-1 flex items-center justify-center px-4 relative">
        {/* Decorative backgrounds */}
        <div className="hidden md:block absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_50%)]" />
        <div className="hidden md:block absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="hidden md:block absolute bottom-1/3 right-1/4 w-40 h-40 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl" />

        {/* 3-column grid absolutely positioned in center */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 grid grid-cols-1 space-y-6 md:space-y-0 md:grid-cols-5 items-center">
          {/* 404 in left column */}
          <div className="justify-self-center pr-2 md:col-span-2 md:justify-self-end">
            <h1 className="text-7xl lg:text-8xl font-black indigo-gradient select-none">404</h1>
          </div>

          {/* Pokeball in center column */}
          <div className="justify-self-center z-10">
            <Link href="/" aria-label="Return home" className="pointer-events-auto">
              <Pokeball
                size="xl"
                className="transform hover:scale-110 transition-transform duration-300 drop-shadow-lg cursor-pointer"
              />
            </Link>
          </div>

          {/* Trainer tip in right column */}
          <div className="justify-self-center pl-2 md:col-span-2 md:justify-self-start">
            <p className="text-sm lg:text-base text-muted opacity-60">
              💡 <span className="font-medium">Trainer Tip:</span> Click the Pokéball!
            </p>
          </div>
        </div>

        {/* Content positioned below center */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 translate-y-32 md:translate-y-16 flex flex-col items-center sm:whitespace-nowrap sm:text-center max-w-lg space-y-6">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary">
            Oh no! The page got away!
          </h2>
          <p className="text-base md:text-lg text-muted">
            Like a wild Pokémon, this page has vanished into the tall grass.
            <br />
            Perhaps it was caught by another trainer?
          </p>
        </div>
      </div>
    </>
  );
}
