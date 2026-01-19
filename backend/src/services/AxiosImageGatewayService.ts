import axios from 'axios';
import { IImageGatewayService } from '~service-interfaces/IImageGatewayService';

export class AxiosImageGatewayService implements IImageGatewayService {
  async fetchImageBuffer(url: string) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return {
      buffer: Buffer.from(response.data),
      contentType: response.headers['content-type'],
    };
  }
}
