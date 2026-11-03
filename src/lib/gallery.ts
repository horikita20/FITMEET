export interface GalleryImage {
  id: string;
  image_url: string;
  caption: string;
  created_at: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isGalleryImage(value: unknown): value is GalleryImage {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.image_url === 'string' &&
    typeof value.caption === 'string' &&
    typeof value.created_at === 'string'
  );
}

export function parseGalleryImages(response: unknown): GalleryImage[] {
  let images: unknown = response;

  if (isRecord(images)) {
    if (Array.isArray(images.images)) {
      images = images.images;
    } else if (Array.isArray(images.data)) {
      images = images.data;
    } else if (isRecord(images.data) && Array.isArray(images.data.images)) {
      images = images.data.images;
    }
  }

  if (!Array.isArray(images)) {
    throw new Error('The gallery API returned an invalid image list.');
  }
  if (!images.every(isGalleryImage)) {
    throw new Error('The gallery API returned an invalid image record.');
  }

  return images;
}
