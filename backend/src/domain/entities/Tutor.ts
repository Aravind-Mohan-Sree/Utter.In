export class Tutor {
  constructor(
    public name: string,
    public email: string,
    public knownLanguages: string[],
    public yearsOfExperience: string,
    public bio: string,
    public password: string | null,
    public googleId: string | null,
    public role: string,
    public isBlocked: boolean,
    public isVerified: boolean,
    public rejectionReason: string,
    public id?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
