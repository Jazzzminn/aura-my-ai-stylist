// Client-side image processor: removes near-white backgrounds and trims
// transparent space so garments sit naturally on the mannequin.

export async function processGarmentImage(file: File): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);

  // Draw to canvas
  const canvas = document.createElement("canvas");
  const maxDim = 1024;
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const { width, height } = canvas;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Sample corners to detect background brightness
  const corners = [
    sample(data, 0, 0, width),
    sample(data, width - 1, 0, width),
    sample(data, 0, height - 1, width),
    sample(data, width - 1, height - 1, width),
  ];
  const avgBg = corners.reduce((a, b) => a + b, 0) / corners.length;
  const isWhiteBg = avgBg > 215;

  if (isWhiteBg) {
    // Remove near-white pixels — softer alpha falloff to avoid harsh edges
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const min = Math.min(r, g, b);
      const max = Math.max(r, g, b);
      const sat = max - min;
      // White-ish: bright + low saturation
      if (min > 235 && sat < 20) {
        data[i + 3] = 0;
      } else if (min > 215 && sat < 30) {
        // Soft edge fade
        const fade = (min - 215) / 20;
        data[i + 3] = Math.max(0, data[i + 3] * (1 - fade));
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // Find content bounding box (ignore fully-transparent pixels)
  let minX = width, minY = height, maxX = 0, maxY = 0;
  let found = false;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > 16) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }
  if (!found) return canvas.toDataURL("image/png");

  // Add small padding
  const pad = 4;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;

  const out = document.createElement("canvas");
  out.width = cropW;
  out.height = cropH;
  const outCtx = out.getContext("2d");
  if (!outCtx) return canvas.toDataURL("image/png");
  outCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

  return out.toDataURL("image/png");
}

function sample(data: Uint8ClampedArray, x: number, y: number, w: number): number {
  const i = (y * w + x) * 4;
  return (data[i] + data[i + 1] + data[i + 2]) / 3;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("image load failed"));
    img.src = src;
  });
}
