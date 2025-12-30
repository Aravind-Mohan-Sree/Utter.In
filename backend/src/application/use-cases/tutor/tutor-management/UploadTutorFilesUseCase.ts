import { unlink } from 'fs/promises';
import { InternalServerError } from '~errors/HttpError';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { IS3Service } from '~service-interfaces/ICloudService';
import { IUploadTutorFilesUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';

export class UploadTutorFilesUseCase implements IUploadTutorFilesUseCase {
  constructor(
    private cloudService: IS3Service,
    private pendingTutorRepo: IPendingTutorRepository,
  ) {}

  async execute(
    email: string,
    introVideoPath: string,
    certificatePath: string,
  ): Promise<void> {
    const pendingTutor = await this.pendingTutorRepo.findOneByField({ email });

    const introVideoUploadResult = await this.cloudService.upload(
      introVideoPath,
      {
        key: `temp/videos/${pendingTutor?.id}.mp4`,
        contentType: 'video/mp4',
      },
    );

    if (!introVideoUploadResult.success) {
      throw new InternalServerError(introVideoUploadResult.error);
    }

    const certificateUploadResult = await this.cloudService.upload(
      certificatePath,
      {
        key: `temp/certificates/${pendingTutor?.id}.pdf`,
        contentType: 'application/pdf',
      },
    );

    if (!certificateUploadResult.success) {
      throw new InternalServerError(certificateUploadResult.error);
    }

    await unlink(introVideoPath);
    await unlink(certificatePath);
  }
}
