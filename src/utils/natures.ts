export type Nature = {
  name: string;
  displayName: string;
  increased: string | null;
  decreased: string | null;
};

export const NATURES: Nature[] = [
  { name: 'hardy',   displayName: 'Hardy',   increased: null,      decreased: null },
  { name: 'lonely',  displayName: 'Lonely',  increased: 'Attack',  decreased: 'Defense' },
  { name: 'brave',   displayName: 'Brave',   increased: 'Attack',  decreased: 'Speed' },
  { name: 'adamant', displayName: 'Adamant', increased: 'Attack',  decreased: 'Sp. Atk' },
  { name: 'naughty', displayName: 'Naughty', increased: 'Attack',  decreased: 'Sp. Def' },
  { name: 'bold',    displayName: 'Bold',    increased: 'Defense', decreased: 'Attack' },
  { name: 'docile',  displayName: 'Docile',  increased: null,      decreased: null },
  { name: 'relaxed', displayName: 'Relaxed', increased: 'Defense', decreased: 'Speed' },
  { name: 'impish',  displayName: 'Impish',  increased: 'Defense', decreased: 'Sp. Atk' },
  { name: 'lax',     displayName: 'Lax',     increased: 'Defense', decreased: 'Sp. Def' },
  { name: 'timid',   displayName: 'Timid',   increased: 'Speed',   decreased: 'Attack' },
  { name: 'hasty',   displayName: 'Hasty',   increased: 'Speed',   decreased: 'Defense' },
  { name: 'serious', displayName: 'Serious', increased: null,      decreased: null },
  { name: 'jolly',   displayName: 'Jolly',   increased: 'Speed',   decreased: 'Sp. Atk' },
  { name: 'naive',   displayName: 'Naive',   increased: 'Speed',   decreased: 'Sp. Def' },
  { name: 'modest',  displayName: 'Modest',  increased: 'Sp. Atk', decreased: 'Attack' },
  { name: 'mild',    displayName: 'Mild',    increased: 'Sp. Atk', decreased: 'Defense' },
  { name: 'quiet',   displayName: 'Quiet',   increased: 'Sp. Atk', decreased: 'Speed' },
  { name: 'bashful', displayName: 'Bashful', increased: null,      decreased: null },
  { name: 'rash',    displayName: 'Rash',    increased: 'Sp. Atk', decreased: 'Sp. Def' },
  { name: 'calm',    displayName: 'Calm',    increased: 'Sp. Def', decreased: 'Attack' },
  { name: 'gentle',  displayName: 'Gentle',  increased: 'Sp. Def', decreased: 'Defense' },
  { name: 'sassy',   displayName: 'Sassy',   increased: 'Sp. Def', decreased: 'Speed' },
  { name: 'careful', displayName: 'Careful', increased: 'Sp. Def', decreased: 'Sp. Atk' },
  { name: 'quirky',  displayName: 'Quirky',  increased: null,      decreased: null },
];
