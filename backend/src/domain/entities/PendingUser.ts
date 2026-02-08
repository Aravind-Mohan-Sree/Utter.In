export class PendingUser {
  constructor(
    public email: string,
    public name?: string,
    public knownLanguages?: string[],
    public password?: string,
    public otp?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
    public id?: string,
    public googleId?: string,
  ) {}
}
