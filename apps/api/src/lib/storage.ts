import fs from 'fs';
import path from 'path';
import logger from './logger';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export async function uploadToStorage(
  buffer: Buffer,
  filename: string,
  _mimetype: string
): Promise<string> {
  try {
    const uploadDir = path.join(UPLOAD_DIR, path.dirname(filename));
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(filepath, buffer);

    const url = `/uploads/${filename}`;
    logger.info('File uploaded successfully', { filename, url });
    return url;
  } catch (error) {
    logger.error('Upload to storage failed:', error);
    throw new Error('Failed to upload file to storage');
  }
}

export async function deleteFromStorage(filename: string): Promise<void> {
  try {
    const filepath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    logger.info('File deleted successfully', { filename });
  } catch (error) {
    logger.error('Delete from storage failed:', error);
    throw new Error('Failed to delete file from storage');
  }
}
