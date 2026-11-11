export const DEFAULT_HEADER = 'linear-gradient(to bottom, rgb(45, 45, 45) 0%, rgb(30, 30, 30) 100%)';

export function getCoverGradient(url: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(DEFAULT_HEADER);
          return;
        }

        canvas.width = 40;
        canvas.height = 40;
        ctx.drawImage(img, 0, 0, 40, 40);

        const data = ctx.getImageData(0, 0, 40, 40).data;
        let [r, g, b] = getHueColor(data) || getMostFrequentColor(data);

        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        if (luma > 140) {
          const factor = 140 / luma;
          r = Math.round(r * factor);
          g = Math.round(g * factor);
          b = Math.round(b * factor);
        }
        if (luma < 60) {
          const lift = Math.round(60 - luma);
          r += lift;
          g += lift;
          b += lift;
        }

        const top = `rgb(${r}, ${g}, ${b})`;
        const bottom = `rgb(${Math.round(r * 0.8)}, ${Math.round(g * 0.8)}, ${Math.round(b * 0.8)})`;
        resolve(`linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), linear-gradient(to bottom, ${top} 0%, ${bottom} 100%)`);
      } catch (error) {
        resolve(DEFAULT_HEADER);
      }
    };

    img.onerror = () => resolve(DEFAULT_HEADER);
  });
}

function getHueColor(data: Uint8ClampedArray): number[] | null {
  const groups: number[][] = [];
  let colored = 0;
  let total = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 200) continue;
    total++;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chroma = max - min;

    if (chroma < 25 || max < 40 || min > 235) continue;

    let hue;
    if (max === r) hue = ((g - b) / chroma + 6) % 6;
    else if (max === g) hue = (b - r) / chroma + 2;
    else hue = (r - g) / chroma + 4;

    const group = Math.floor(((hue * 60 + 30) % 360) / 60);
    if (!groups[group]) groups[group] = [0, 0, 0, 0];
    groups[group][0] += r;
    groups[group][1] += g;
    groups[group][2] += b;
    groups[group][3]++;
    colored++;
  }

  if (total === 0 || colored < total * 0.3) return null;

  let best = groups.find(group => group)!;
  for (const group of groups) {
    if (group && group[3] > best[3]) best = group;
  }

  return [Math.round(best[0] / best[3]), Math.round(best[1] / best[3]), Math.round(best[2] / best[3])];
}

function getMostFrequentColor(data: Uint8ClampedArray): number[] {
  const counts: { [key: string]: number } = {};

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 200) continue;

    const r = Math.min(255, Math.round(data[i] / 32) * 32);
    const g = Math.min(255, Math.round(data[i + 1] / 32) * 32);
    const b = Math.min(255, Math.round(data[i + 2] / 32) * 32);

    const key = r + ',' + g + ',' + b;
    counts[key] = (counts[key] || 0) + 1;
  }

  const colors = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  if (colors.length === 0) return [45, 45, 45];

  return colors[0].split(',').map(Number);
}
