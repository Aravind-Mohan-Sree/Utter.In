export interface FileInput {
  fieldname: string;
  originalname?: string;
  mimetype: string;
  path: string;
  size: number;
}

export interface ValidatedData {
  success: boolean;
  message: string;
}

export interface IValidateDataService {
  validateName(name: string): ValidatedData;
  validateBio(bio: string): ValidatedData;
  validateEmail(email: string): ValidatedData;
  validateKnownLanguages(knownLanguages: string[]): ValidatedData;
  validateExperience(experience: string): ValidatedData;
  validateIntroVideo(introVideo: FileInput): ValidatedData;
  validateCertificate(certificate: FileInput): ValidatedData;
  validatePassword(password: string): ValidatedData;
  validateOtp(otp: string): ValidatedData;
  validateAvatar(avatar: FileInput): ValidatedData;
}
