'use client';

import { useRouter } from 'next/router';
import Icon from './icons';
import { ReactNode } from 'react';

// Gen 1–9 national dex ceiling (covers all current species)
const MAX_NATIONAL_DEX_ID = 1025;

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

  const handleClick = () => {
    const randomId = Math.floor(Math.random() * MAX_NATIONAL_DEX_ID) + 1;
    router.push(`/pokemon/${randomId}`);
  };

  return (
    <button
      onClick={handleClick}
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
