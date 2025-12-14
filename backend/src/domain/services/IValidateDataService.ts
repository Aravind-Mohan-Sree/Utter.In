export interface ValidatedData {
  success: boolean;
  message: string;
}

export interface IValidateDataService {
  validateName(name: string): ValidatedData;
  validateEmail(email: string): ValidatedData;
  validateKnownLanguages(knownLanguages: string[]): ValidatedData;
  validateExperience(experience: string): ValidatedData;
  validateIntroVideo(introVideo: File): ValidatedData;
  validateCertificate(certificate: File): ValidatedData;
  validatePassword(password: string): ValidatedData;
  validateOtp(otp: string): ValidatedData;
}
