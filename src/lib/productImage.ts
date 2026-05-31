const SQUARE_TRANSFORM = "c_fill,g_center";

export function squareImageUrl(url: string, size = 400): string {
  if (!url) return url;
  const transform = `${SQUARE_TRANSFORM},w_${size},h_${size}`;
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    if (/\/upload\/[^/]*c_/.test(url)) return url;
    return url.replace("/upload/", `/upload/${transform}/`);
  }
  return url;
}
