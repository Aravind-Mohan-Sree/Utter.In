import { ITokenService, TokenPayload } from '~service-interfaces/ITokenService';
import jwt, { Algorithm } from 'jsonwebtoken';
import { env } from '~config/env';

const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';
const RESET_EXPIRY = '2m';

export class TokenValidationError extends Error {}

/**
 * Concrete implementation of ITokenService using JSON Web Tokens (JWT).
 * Handles generation and verification of access, refresh, and password reset tokens.
 */
export class JwtService implements ITokenService {
  /**
   * Generates a short-lived access token for session authentication.
   */
  public generateAuthToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_EXPIRY,
      algorithm: env.JWT_ALGORITHM as Algorithm,
    });
  }

  /**
   * Generates a long-lived refresh token to obtain new access tokens.
   */
  public generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_EXPIRY,
      algorithm: env.JWT_ALGORITHM as Algorithm,
    });
  }

  /**
   * Generates a very short-lived token for secure password reset flows.
   */
  public generateResetToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.RESET_TOKEN_SECRET, {
      expiresIn: RESET_EXPIRY,
      algorithm: env.JWT_ALGORITHM as Algorithm,
    });
  }

  /**
   * Generic internal token verification logic with specific error mapping.
   */
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

  /**
   * Verifies an access token's validity and signature.
   */
  public verifyAuthToken(token: string): TokenPayload {
    return this.verifyToken(token, env.ACCESS_TOKEN_SECRET);
  }

  /**
   * Verifies a refresh token.
   */
  public verifyRefreshToken(token: string): TokenPayload {
    return this.verifyToken(token, env.REFRESH_TOKEN_SECRET);
  }

  /**
   * Verifies a password reset token.
   */
  public verifyResetToken(token: string): TokenPayload {
    return this.verifyToken(token, env.RESET_TOKEN_SECRET);
  }

  /**
   * Decodes a token without verifying its signature. 
   * Useful for extracting data when the signature is already trusted or not needed.
   */
  public decode(token: string): TokenPayload {
    const decoded = jwt.decode(token);

    if (!decoded || typeof decoded === 'string') {
      throw new Error('Could not decode token.');
    }

    return decoded as TokenPayload;
  }
}
