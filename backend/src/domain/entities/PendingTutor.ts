export class PendingTutor {
  constructor(
    public email: string,
    public name?: string,
    public knownLanguages?: string[],
    public yearsOfExperience?: string,
    public password?: string,
    public otp?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
