import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// ── Cloudinary availability check ─────────────────────────────────────────────
const isCloudinaryConfigured =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

// ── Backend base URL ─────────────────────────────────────────────────────────
// Used to build absolute image URLs when saving to local disk.
// Override with BACKEND_URL=https://your-api.com in production .env
const BACKEND_URL = (
  process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`
).replace(/\/$/, '');

let storage: StorageEngine;

if (isCloudinaryConfigured) {
  // ── Cloudinary storage ────────────────────────────────────────────────────
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary,
    params: async (_req, file) => ({
      folder:          'relife_app',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      public_id:       `${file.fieldname}-${Date.now()}`,
    }),
  }) as StorageEngine;

  console.log('📸 Upload service: Cloudinary');
} else {
  // ── Local disk fallback ───────────────────────────────────────────────────
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename:    (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `${file.fieldname}-${Date.now()}${ext}`);
    },
  });

  console.log(`📸 Upload service: local disk → ${uploadDir}`);
  console.log(`   Serving images at: ${BACKEND_URL}/uploads/<filename>`);
  console.log('   Add CLOUDINARY_* vars to .env to switch to cloud storage.');
}

// ── File filter ───────────────────────────────────────────────────────────────
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP and GIF images are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

export default upload;

/**
 * Returns a publicly-accessible URL for the uploaded file.
 *
 * Cloudinary → file.path is already a full https:// CDN URL, return as-is.
 * Local disk  → file.path is an absolute filesystem path, convert to
 *               http://localhost:5000/uploads/<filename>
 *               so the frontend (running on a different port) can fetch it.
 */
export function getFileUrl(file: Express.Multer.File): string {
  if (isCloudinaryConfigured) {
    return file.path; // Already a full Cloudinary URL
  }
  const filename = path.basename(file.path);
  return `${BACKEND_URL}/uploads/${filename}`;
}