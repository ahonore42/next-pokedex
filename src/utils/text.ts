// Utility function to capitalize Pokemon names
export function capitalizeName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const capitalizeWords = (str: string) => str.replace(/\b\w/g, (l) => l.toUpperCase());
