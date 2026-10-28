export const GENERI_DISPONIBILI = [
  'Pop',
  'Hip Hop',
  'Rock',
  'Punk',
  'Metal',
  'Experimental',
  'Electronic',
  'Folk',
  'Country',
  'Jazz',
  'Blues',
  'Reggae',
] as const;

export type Genere = typeof GENERI_DISPONIBILI[number];