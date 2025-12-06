export class User {
  constructor(
    public name: string,
    public email: string,
    public knownLanguages: string[],
    public password: string,
    public createdAt?: Date,
    public updatedAt?: Date,
    public googleId?: string | null,
    public streak?: {
      lastActive: Date | null;
      currentStreak: number;
      highestStreak: number;
    } | null,
    public id?: string,
    public isBlocked = false,
    public role = 'user',
    public bio = 'I am a Philologist!',
  ) {}
}
