import { ITokenService, TokenPayload } from '~service-interfaces/ITokenService';
import jwt, { Algorithm } from 'jsonwebtoken';
import { env } from '~config/env';

const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';
const RESET_EXPIRY = '2m';

export class TokenValidationError extends Error {}

export class JwtService implements ITokenService {
  public generateAuthToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_EXPIRY,
      algorithm: env.JWT_ALGORITHM as Algorithm,
    });
  }

  public generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_EXPIRY,
      algorithm: env.JWT_ALGORITHM as Algorithm,
    });
  }

  public generateResetToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.RESET_TOKEN_SECRET, {
      expiresIn: RESET_EXPIRY,
      algorithm: env.JWT_ALGORITHM as Algorithm,
    });
  }

  private verifyToken(token: string, secret: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, secret) as TokenPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenValidationError('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new TokenValidationError('Invalid token signature');
      }
      throw new TokenValidationError('Token validation failed');
    }
  }

  public verifyAuthToken(token: string): TokenPayload {
    return this.verifyToken(token, env.ACCESS_TOKEN_SECRET);
  }

  public verifyRefreshToken(token: string): TokenPayload {
    return this.verifyToken(token, env.REFRESH_TOKEN_SECRET);
  }

  public verifyResetToken(token: string): TokenPayload {
    return this.verifyToken(token, env.RESET_TOKEN_SECRET);
  }

  public decode(token: string): TokenPayload {
    const decoded = jwt.decode(token);

    if (!decoded || typeof decoded === 'string') {
      throw new Error('Could not decode token.');
    }

    return decoded as TokenPayload;
  }
}
