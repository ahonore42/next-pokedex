'use client';

import { useRouter } from 'next/router';
import { usePokemonCache } from '~/lib/contexts/PokedexCacheContext';
import Icon from './icons';
import { ReactNode } from 'react';

interface RandomPokemonLinkProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  ariaLabel: string;
}

export default function RandomPokemonLink({
  icon,
  title,
  description,
  ariaLabel,
}: RandomPokemonLinkProps) {
  const router = useRouter();
  const { pokemonDataArray } = usePokemonCache();

  const handleClick = () => {
    if (pokemonDataArray.length === 0) return;
    const maxSpeciesId = Math.max(...pokemonDataArray.map((p) => p.speciesId));
    const randomId = Math.floor(Math.random() * maxSpeciesId) + 1;
    router.push(`/pokemon/${randomId}`);
  };

  return (
    <button
      onClick={handleClick}
      disabled={pokemonDataArray.length === 0}
      aria-label={ariaLabel}
      className="
        min-h-24
        relative
        group block border
        pokemon card
        interactive-link
        transition-interactive
        text-left w-full
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      <div className="flex items-start gap-2">
        {icon && <div className="group-hover:scale-110 transition-interactive">{icon}</div>}
        <div className="flex flex-col gap-2 transition-interactive">
          {title && <h3 className="font-semibold text-primary group-hover:text-brand">{title}</h3>}
          {description && (
            <span className="text-sm text-muted group-hover:text-muted">{description}</span>
          )}
        </div>
      </div>
      <div className="absolute right-2">
        <Icon
          type="chevron-right"
          className="text-muted group-hover:text-brand transform group-hover:translate-x-1 transition-interactive"
        />
      </div>
    </button>
  );
}
