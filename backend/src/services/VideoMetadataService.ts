import ffmpeg from 'fluent-ffmpeg';
import ffprobe from 'ffprobe-static';
import { logger } from '~logger/logger';
import { errorMessage } from '~constants/errorMessage';
import { unlink } from 'fs/promises';

/**
 * Service to extract metadata from video files using ffmpeg/ffprobe.
 */
export class VideoMetadataService {
  /**
   * Probes a video file to determine its duration in seconds.
   * If probing fails, the file is deleted from the local system.
   */
  async getDuration(filePath: string): Promise<number> {
    try {
      const duration = await new Promise<number>((resolve, reject) => {
        ffmpeg.setFfprobePath(ffprobe.path);

        ffmpeg.ffprobe(filePath, (err, data) => {
          if (err) return reject(err);

          const d = data.format?.duration || 0;
          resolve(Number(d));
        });
      });

      return duration;
    } catch (error) {
      // Clean up local file on error to prevent storage leaks
      await unlink(filePath);
      logger.error(error);
      throw new Error(errorMessage.SOMETHING_WRONG);
    }
  }
}
