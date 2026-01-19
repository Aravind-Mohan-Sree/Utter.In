export class User {
  constructor(
    public name: string,
    public email: string,
    public knownLanguages: string[],
    public bio: string,
    public password: string,
    public googleId: string | null,
    public streak: {
      lastActive: Date | null;
      currentStreak: number;
      highestStreak: number;
    } | null,
    public role: string,  
    public isBlocked: boolean,
    public id?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
