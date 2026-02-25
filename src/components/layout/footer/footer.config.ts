import { type FooterColumnLinks } from './footer.types';

export const footerColumns: FooterColumnLinks[] = [
  {
    title: 'Database',
    links: [
      { href: '/pokemon', label: 'Pokémon' },
      { href: '/moves', label: 'Moves' },
      { href: '/abilities', label: 'Abilities' },
      { href: '/items', label: 'Items' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { href: '/pokemon-types', label: 'Type Chart' },
      { href: '/calculator', label: 'Damage Calculator' },
      { href: '/teams', label: 'Teambuilder' },
      { href: '/random', label: 'Random Pokémon' },
    ],
  },
  {
    title: 'Generations',
    links: [
      { href: '/pokedex/1', label: 'Generation I' },
      { href: '/pokedex/2', label: 'Generation II' },
      { href: '/pokedex/3', label: 'Generation III' },
      { href: '/pokedex/4', label: 'Generation IV' },
    ],
  },
  {
    title: 'About',
    links: [
      { href: '/about', label: 'About This Site' },
      { href: '/api', label: 'API Documentation' },
      { href: '/contact', label: 'Contact' },
      { href: '/privacy', label: 'Privacy Policy' },
    ],
  },
];
