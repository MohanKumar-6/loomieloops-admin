const OUTPUT_SIZE = 1200;
const HERO_WIDTH = 1200;
const HERO_HEIGHT = 900;

function centerCropRect(
  srcW: number,
  srcH: number,
  targetW: number,
  targetH: number,
): { sx: number; sy: number; sw: number; sh: number } {
  const targetRatio = targetW / targetH;
  const srcRatio = srcW / srcH;
  if (srcRatio > targetRatio) {
    const sh = srcH;
    const sw = sh * targetRatio;
    return { sx: (srcW - sw) / 2, sy: 0, sw, sh };
  }
  const sw = srcW;
  const sh = sw / targetRatio;
  return { sx: 0, sy: (srcH - sh) / 2, sw, sh };
}

async function cropToCanvas(
  file: File,
  width: number,
  height: number,
): Promise<{ blob: Blob; preview: string }> {
  const bitmap = await createImageBitmap(file);
  const { sx, sy, sw, sh } = centerCropRect(bitmap.width, bitmap.height, width, height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to encode image"))),
      "image/jpeg",
      0.92,
    );
  });

  const preview = canvas.toDataURL("image/jpeg", 0.85);
  return { blob, preview };
}

/** Center-crop an image file to a square JPEG blob + preview data URL. */
export async function cropImageToSquare(file: File): Promise<{ blob: Blob; preview: string }> {
  const bitmap = await createImageBitmap(file);
  const size = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - size) / 2;
  const sy = (bitmap.height - size) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(bitmap, sx, sy, size, size, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to encode image"))),
      "image/jpeg",
      0.92,
    );
  });

  const preview = canvas.toDataURL("image/jpeg", 0.85);
  return { blob, preview };
}

/** Center-crop to 4:3 for homepage hero card. */
export async function cropImageForHero(file: File): Promise<{ blob: Blob; preview: string }> {
  return cropToCanvas(file, HERO_WIDTH, HERO_HEIGHT);
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
