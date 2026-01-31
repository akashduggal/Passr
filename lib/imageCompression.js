import { Image } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

const THUMBNAIL_MAX = 300;
const DETAIL_MAX_WIDTH = 1200;
const THUMBNAIL_QUALITY = 0.8;
const DETAIL_QUALITY = 0.85;

function getImageDimensions(uri) {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (err) => reject(err)
    );
  });
}

export async function compressToThumbnail(uri) {
  const { width, height } = await getImageDimensions(uri);
  const max = Math.max(width, height);
  const actions = [];
  if (max > THUMBNAIL_MAX) {
    if (width >= height) {
      actions.push({ resize: { width: THUMBNAIL_MAX } });
    } else {
      actions.push({ resize: { height: THUMBNAIL_MAX } });
    }
  }
  const result = await ImageManipulator.manipulateAsync(
    uri,
    actions.length ? actions : [{ resize: { width, height } }],
    { compress: THUMBNAIL_QUALITY, format: ImageManipulator.SaveFormat.WEBP }
  );
  return { uri: result.uri, width: result.width, height: result.height };
}

export async function compressToDetail(uri) {
  const { width, height } = await getImageDimensions(uri);
  const actions = width > DETAIL_MAX_WIDTH ? [{ resize: { width: DETAIL_MAX_WIDTH } }] : [];
  const result = await ImageManipulator.manipulateAsync(
    uri,
    actions.length ? actions : [{ resize: { width, height } }],
    { compress: DETAIL_QUALITY, format: ImageManipulator.SaveFormat.WEBP }
  );
  return { uri: result.uri, width: result.width, height: result.height };
}

export async function compressListingImage(originalUri) {
  const [thumbnail, detail] = await Promise.all([
    compressToThumbnail(originalUri),
    compressToDetail(originalUri),
  ]);
  return {
    originalUri,
    thumbnail: { uri: thumbnail.uri, width: thumbnail.width, height: thumbnail.height },
    detail: { uri: detail.uri, width: detail.width, height: detail.height },
  };
}

export function formatFileSize(bytes) {
  if (bytes == null || isNaN(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function compressionRatioPercent(originalBytes, compressedBytes) {
  if (originalBytes == null || compressedBytes == null || originalBytes === 0) return null;
  const pct = (1 - compressedBytes / originalBytes) * 100;
  return Math.round(pct * 10) / 10;
}

export function isSupportedImageFormat(type) {
  if (!type) return false;
  const t = type.toLowerCase();
  return t.includes('image/jpeg') || t.includes('image/jpg') || t.includes('image/png') || t.includes('image/webp');
}
