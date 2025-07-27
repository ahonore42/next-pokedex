export default function Copyright() {
  const year = new Date().getFullYear();
  return (
    <div className="max-w-96 mx-auto h-24 flex flex-col justify-center text-sm text-subtle text-center">
      <p>© {year} Evolve Pokédex</p>
      <p className="mt-1">
        Pokémon and all related characters are trademarks of Nintendo, Game Freak, and Creatures
        Inc.
      </p>
    </div>
  );
}
