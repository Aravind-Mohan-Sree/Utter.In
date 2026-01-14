import { InternalServerError } from '~errors/HttpError';
import { IS3Service } from '~service-interfaces/ICloudService';
import { IDeleteFilesUseCase } from '~use-case-interfaces/admin/ITutorsUseCase';

export class DeleteFilesUseCase implements IDeleteFilesUseCase {
  constructor(private cloudService: IS3Service) {}

  async execute(id: string): Promise<void> {
    const videoDeleteResult = await this.cloudService.delete(
      `tutors/videos/${id}.mp4`,
    );

    if (!videoDeleteResult.success) {
      throw new InternalServerError(videoDeleteResult.error);
    }

    const certificateDeleteResult = await this.cloudService.delete(
      `tutors/certificates/${id}.pdf`,
    );

    if (!certificateDeleteResult.success) {
      throw new InternalServerError(certificateDeleteResult.error);
    }
  }
}
