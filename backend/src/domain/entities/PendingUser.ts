export class PendingUser {
  constructor(
    public name: string,
    public email: string,
    public knownLanguages: string[],
    public password: string,
    public otp?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
