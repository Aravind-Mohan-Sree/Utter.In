export interface IImageGatewayService {
  fetchImageBuffer(
    url: string,
  ): Promise<{ buffer: Buffer; contentType: string }>;
}
