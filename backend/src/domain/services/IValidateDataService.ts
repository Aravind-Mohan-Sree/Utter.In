export interface ValidatedData {
  success: boolean;
  message: string;
}

export interface IValidateDataService {
  validateName(name: string): ValidatedData;
  validateEmail(email: string): ValidatedData;
  validateKnownLanguages(knownLanguages: string[]): ValidatedData;
  validatePassword(password: string): ValidatedData;
}
