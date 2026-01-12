import { Tutor } from '~entities/Tutor';

export class TutorMapper {
  static toResponse(tutor: Tutor) {
    return {
      id: tutor.id,
      name: tutor.name,
      email: tutor.email,
      knownLanguages: tutor.knownLanguages,
      yearsOfExperience: tutor.yearsOfExperience,
      bio: tutor.bio,
      role: tutor.role,
      isBlocked: tutor.isBlocked,
      isVerified: tutor.isVerified,
      rejectionReason: tutor.rejectionReason,
    };
  }
}

export type TutorResponseDTO = ReturnType<typeof TutorMapper.toResponse>;
