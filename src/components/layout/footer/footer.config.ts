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
      { href: '/type-chart', label: 'Type Chart' },
      { href: '/calculator', label: 'Damage Calculator' },
      { href: '/team-builder', label: 'Team Builder' },
      { href: '/random', label: 'Random Pokémon' },
    ],
  },
  {
    title: 'Generations',
    links: [
      { href: '/generation/1', label: 'Generation I' },
      { href: '/generation/2', label: 'Generation II' },
      { href: '/generation/3', label: 'Generation III' },
      { href: '/generation/4', label: 'Generation IV' },
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
