export class Tutor {
  constructor(
    public name: string,
    public email: string,
    public knownLanguages: string[],
    public yearsOfExperience: string,
    public bio: string,
    public password: string,
    public googleId: string | null,
    public role: string,
    public isBlocked: boolean,
    public isVerified: boolean,
    public certificationType: string | null,
    public rejectionReason: string | null,
    public id?: string,
    public expiresAt?: Date,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
