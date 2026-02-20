import { Readable } from 'stream';
import { createReadStream, unlinkSync } from 'fs';

interface OSSConfig {
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  region: string;
  endpoint?: string;
}

class OSSService {
  private config: OSSConfig;
  private enabled: boolean;

  constructor() {
    this.config = {
      accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
      bucket: process.env.OSS_BUCKET || '',
      region: process.env.OSS_REGION || 'oss-cn-hangzhou',
      endpoint: process.env.OSS_ENDPOINT,
    };

    this.enabled = !!(
      this.config.accessKeyId &&
      this.config.accessKeySecret &&
      this.config.bucket
    );
  }

  async uploadFile(
    filePath: string,
    key: string,
    contentType?: string
  ): Promise<string> {
    if (!this.enabled) {
      throw new Error('OSS is not configured');
    }

    const fileStream = createReadStream(filePath);
    const url = await this.uploadStream(fileStream, key, contentType);

    try {
      unlinkSync(filePath);
    } catch (err) {
      console.error('Failed to delete temp file:', err);
    }

    return url;
  }

  async uploadBuffer(
    buffer: Buffer,
    key: string,
    contentType?: string
  ): Promise<string> {
    if (!this.enabled) {
      throw new Error('OSS is not configured');
    }

    const stream = Readable.from(buffer);
    return this.uploadStream(stream, key, contentType);
  }

  async uploadStream(
    stream: Readable,
    key: string,
    contentType?: string
  ): Promise<string> {
    if (!this.enabled) {
      throw new Error('OSS is not configured');
    }

    const url = `https://${this.config.bucket}.${this.config.region}.aliyuncs.com/${key}`;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[OSS Mock] Upload ${key} -> ${url}`);
      return url;
    }

    const response = await fetch(`https://${this.config.bucket}.${this.config.region}.aliyuncs.com/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'x-oss-object-acl': 'public-read',
      },
      body: stream as any,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OSS upload failed: ${error}`);
    }

    return url;
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.enabled) {
      console.log(`[OSS Mock] Delete ${key}`);
      return;
    }

    const response = await fetch(`https://${this.config.bucket}.${this.config.region}.aliyuncs.com/${key}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OSS delete failed: ${error}`);
    }
  }

  async getFileUrl(key: string, expiresIn = 3600): Promise<string> {
    if (!this.enabled) {
      return `https://${this.config.bucket}.${this.config.region}.aliyuncs.com/${key}`;
    }

    const timestamp = Math.floor(Date.now() / 1000) + expiresIn;
    const signature = this.generateSignature('GET', key, '', timestamp);

    return `https://${this.config.bucket}.${this.config.region}.aliyuncs.com/${key}?OSSAccessKeyId=${this.config.accessKeyId}&Expires=${timestamp}&Signature=${signature}`;
  }

  private generateSignature(method: string, key: string, contentType: string, expires: number): string {
    const stringToSign = `${method}\n\n${contentType}\n${expires}\n/${this.config.bucket}/${key}`;
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha1', this.config.accessKeySecret);
    hmac.update(stringToSign);
    return hmac.digest('base64');
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const ossService = new OSSService();
