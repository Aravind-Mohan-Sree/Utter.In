export interface TokenPayload {
  id?: string;
  email?: string;
  role?: 'user' | 'tutor' | 'admin';
}

export interface ITokenService {
  generateAuthToken(payload: TokenPayload): string;
  generateRefreshToken(payload: TokenPayload): string;
  generateResetToken(payload: TokenPayload): string;
  verifyAuthToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
  verifyResetToken(token: string): TokenPayload;
  decode(token: string): TokenPayload;
}
