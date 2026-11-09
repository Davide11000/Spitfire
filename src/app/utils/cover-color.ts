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
        if (colors.length === 0) {
          resolve(DEFAULT_HEADER);
          return;
        }

        let [r, g, b] = colors[0].split(',').map(Number);

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
        const bottom = `rgb(${Math.round(r * 0.6)}, ${Math.round(g * 0.6)}, ${Math.round(b * 0.6)})`;
        resolve(`linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), linear-gradient(to bottom, ${top} 0%, ${bottom} 100%)`);
      } catch (error) {
        resolve(DEFAULT_HEADER);
      }
    };

    img.onerror = () => resolve(DEFAULT_HEADER);
  });
}
