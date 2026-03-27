import imageCompression from 'browser-image-compression';

const MAX_SIZE_MB = 1;
const MAX_WIDTH_OR_HEIGHT = 1920;

/**
 * Compress an image file if it exceeds maxSizeMB. Returns original file if not an image or already small enough.
 */
export async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  if (file.size <= MAX_SIZE_MB * 1024 * 1024) return file;
  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: MAX_SIZE_MB,
      maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
      useWebWorker: true,
      preserveExif: false,
    });
    // Ensure filename keeps a valid image extension so backend accepts it
    const base = file.name.replace(/\.[^.]+$/, '') || 'image';
    const ext = compressed.type === 'image/png' ? 'png' : compressed.type === 'image/webp' ? 'webp' : 'jpg';
    if (!compressed.name || !/\.(jpe?g|png|gif|webp)$/i.test(compressed.name)) {
      return new File([compressed], `${base}.${ext}`, { type: compressed.type, lastModified: Date.now() });
    }
    return compressed;
  } catch {
    return file;
  }
}

/**
 * Compress multiple image files (only those > 1MB). Non-image files are returned as-is.
 */
export async function compressImageFiles(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImageFile));
}
