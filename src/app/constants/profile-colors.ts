export const PROFILE_COLORS = [
  { name: 'Red', value: '#c62828' },
  { name: 'Orange', value: '#ef6c00' },
  { name: 'Yellow', value: '#f9a825' },
  { name: 'Green', value: '#2e7d32' },
  { name: 'Teal', value: '#00897b' },
  { name: 'Sky', value: '#4fc3f7' },
  { name: 'Blue', value: '#1565c0' },
  { name: 'Purple', value: '#6a1b9a' },
  { name: 'Pink', value: '#f48fb1' },
  { name: 'Brown', value: '#6d4c41' },
  { name: 'Grey', value: '#78909c' },
  { name: 'Sand', value: '#e6d3a3' }
];

export function isLightColor(hex: string): boolean {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}
