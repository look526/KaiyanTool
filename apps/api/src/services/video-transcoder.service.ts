import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { unlinkSync, mkdirSync } from 'fs';
import { ossService } from '../lib/oss';
import logger from '../lib/logger';

const execAsync = promisify(exec);

interface VideoTranscodeOptions {
  inputPath: string;
  outputPath: string;
  format: 'mp4' | 'webm';
  resolution?: '480p' | '720p' | '1080p' | '4k';
  bitrate?: string;
  fps?: number;
  audioBitrate?: string;
}

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  format: string;
  size: number;
}

class VideoTranscoderService {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp', 'videos');
    try {
      mkdirSync(this.tempDir, { recursive: true });
    } catch (err) {
      console.error('Failed to create temp directory:', err);
    }
  }

  async getVideoMetadata(filePath: string): Promise<VideoMetadata> {
    const command = `ffprobe -v error -show_entries format=duration,size -show_entries stream=width,height,codec_name,r_frame_rate -of json "${filePath}"`;
    const { stdout } = await execAsync(command);
    const data = JSON.parse(stdout);

    const format = data.format || {};
    const stream = data.streams?.[0] || {};

    return {
      duration: parseFloat(format.duration || '0'),
      width: parseInt(stream.width || '0'),
      height: parseInt(stream.height || '0'),
      fps: parseFloat(stream.r_frame_rate || '0'),
      codec: stream.codec_name || '',
      format: format.format_name || '',
      size: parseInt(format.size || '0'),
    };
  }

  async transcodeVideo(options: VideoTranscodeOptions): Promise<string> {
    const { inputPath, outputPath, format, resolution = '1080p', bitrate = '2M', fps = 30, audioBitrate = '128k' } = options;

    const resolutionMap: Record<string, string> = {
      '480p': '854x480',
      '720p': '1280x720',
      '1080p': '1920x1080',
      '4k': '3840x2160',
    };

    const size = resolutionMap[resolution];

    const command = [
      'ffmpeg',
      '-i', inputPath,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      '-b:v', bitrate,
      '-maxrate', bitrate,
      '-bufsize', `${bitrate}M`,
      '-r', fps.toString(),
      '-c:a', 'aac',
      '-b:a', audioBitrate,
      '-movflags', '+faststart',
      '-vf', `scale=${size}:-2`,
      '-f', format,
      '-y',
      outputPath,
    ].join(' ');

    logger.info('Starting video transcode', { inputPath, outputPath, resolution, format });

    await execAsync(command);

    logger.info('Video transcode completed', { outputPath });

    return outputPath;
  }

  async generateThumbnail(videoPath: string, time: number = 1): Promise<string> {
    const outputDir = path.join(this.tempDir, 'thumbnails');
    const filename = `thumb-${Date.now()}.jpg`;
    const outputPath = path.join(outputDir, filename);

    const command = `ffmpeg -i "${videoPath}" -ss ${time} -vframes 1 -vf "scale=320:-1" -y "${outputPath}"`;
    await execAsync(command);

    logger.info('Thumbnail generated', { videoPath, outputPath });

    return outputPath;
  }

  async uploadVideo(filePath: string, key: string): Promise<string> {
    const metadata = await this.getVideoMetadata(filePath);

    let url: string;
    if (ossService.isEnabled()) {
      url = await ossService.uploadFile(filePath, key, 'video/mp4');
    } else {
      url = `/uploads/videos/${path.basename(filePath)}`;
    }

    try {
      unlinkSync(filePath);
    } catch (err) {
      logger.error('Failed to delete temp video file', { error: err });
    }

    return url;
  }

  async transcodeAndUpload(
    inputPath: string,
    options: Partial<VideoTranscodeOptions> = {}
  ): Promise<{ url: string; metadata: VideoMetadata }> {
    const timestamp = Date.now();
    const filename = `video-${timestamp}.${options.format || 'mp4'}`;
    const outputPath = path.join(this.tempDir, filename);

    await this.transcodeVideo({
      inputPath,
      outputPath,
      format: options.format || 'mp4',
      resolution: options.resolution || '1080p',
      bitrate: options.bitrate,
      fps: options.fps,
      audioBitrate: options.audioBitrate,
    });

    const metadata = await this.getVideoMetadata(outputPath);
    const url = await this.uploadVideo(outputPath, `videos/${filename}`);

    return { url, metadata };
  }
}

export const videoTranscoderService = new VideoTranscoderService();
