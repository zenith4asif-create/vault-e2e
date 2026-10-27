// Cloudinary Client-side upload service
// Credentials:
// Upload Preset: ml_default
// Cloud Name: yuasb9xa
// API Key: 331236418415425

export const CLOUDINARY_CONFIG = {
  cloudName: 'yuasb9xa',
  uploadPreset: 'ml_default',
  apiKey: '331236418415425'
};

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  bytes: number;
  format: string;
  resourceType: 'image' | 'video' | 'raw';
  originalFilename: string;
}

export function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export async function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
  let resourceType = 'auto';
  if (file.type.startsWith('image/')) {
    resourceType = 'image';
  } else if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
    resourceType = 'video';
  } else {
    resourceType = 'auto';
  }

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('api_key', CLOUDINARY_CONFIG.apiKey);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve({
            secureUrl: res.secure_url,
            publicId: res.public_id,
            bytes: res.bytes || file.size,
            format: res.format || file.name.split('.').pop() || '',
            resourceType: res.resource_type || (resourceType as 'image' | 'video' | 'raw'),
            originalFilename: res.original_filename || file.name
          });
        } catch {
          reject(new Error('Failed to parse Cloudinary response'));
        }
      } else {
        try {
          const errorRes = JSON.parse(xhr.responseText);
          reject(new Error(errorRes.error?.message || `Upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Upload failed (${xhr.status}): ${xhr.statusText}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload to Cloudinary. Check connection.'));
    };

    xhr.send(formData);
  });
}
