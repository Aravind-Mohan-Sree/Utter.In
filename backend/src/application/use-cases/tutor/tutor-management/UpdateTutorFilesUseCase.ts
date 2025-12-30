import { InternalServerError } from '~errors/HttpError';
import { IS3Service } from '~service-interfaces/ICloudService';
import { IUpdateTutorFilesUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';

export class UpdateTutorFilesUseCase implements IUpdateTutorFilesUseCase {
  constructor(private cloudService: IS3Service) {}

  async execute(oldId: string, newId: string): Promise<void> {
    const videoFromKey = `temp/videos/${oldId}.mp4`;
    const videoToKey = `tutors/videos/${newId}.mp4`;
    const certificateFromKey = `temp/certificates/${oldId}.pdf`;
    const certificateToKey = `tutors/certificates/${newId}.pdf`;

    let updateResult = await this.cloudService.update(videoFromKey, videoToKey);

    if (!updateResult.success)
      throw new InternalServerError(updateResult.error);

    updateResult = await this.cloudService.update(
      certificateFromKey,
      certificateToKey,
    );

    if (!updateResult.success)
      throw new InternalServerError(updateResult.error);
  }
}
