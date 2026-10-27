export type VaultCategory =
  | 'credential'
  | 'backup'
  | 'note'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'link'
  | 'contact';

export interface VaultItem {
  id: string;
  category: VaultCategory;
  service: string; // Title / Service Name / Contact Name / File Label
  username?: string;
  password?: string;
  backupCodes?: string;
  notes?: string;
  // Cloudinary media & file metadata (encrypted end-to-end)
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  publicId?: string;
  thumbnailUrl?: string;
  // Specific entity fields
  url?: string;           // For bookmarks / links
  phoneNumber?: string;   // For contacts / phone numbers
  email?: string;         // For contacts
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface VaultBlob {
  version: number;
  salt: string;        // base64
  iv: string;          // base64
  ciphertext: string;  // base64
  updatedAt: number;
}

export interface VaultMetadata {
  salt: string;
  updatedAt?: number;
}

export type ViewState = 'login' | 'unlock' | 'dashboard';
