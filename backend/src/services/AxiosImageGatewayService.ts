import axios from 'axios';
import { IImageGatewayService } from '~service-interfaces/IImageGatewayService';

/**
 * Concrete implementation of IImageGatewayService using Axios.
 * Fetches external images (e.g., from Google OAuth) and returns them as buffers.
 */
export class AxiosImageGatewayService implements IImageGatewayService {
  /**
   * Fetches an image from a URL as an arraybuffer.
   */
  async fetchImageBuffer(url: string) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return {
      buffer: Buffer.from(response.data),
      contentType: response.headers['content-type'],
    };
  }
}
