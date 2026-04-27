import { IHashService } from '~service-interfaces/IHashService';
import bcrypt from 'bcrypt';

/**
 * Concrete implementation of IHashService using bcrypt.
 * Handles password hashing and comparison for secure authentication.
 */
export class HashService implements IHashService {
  /**
   * Hashes a plain-text password using a salt factor of 10.
   */
  async hash(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 10);

    return hashedPassword;
  }

  /**
   * Compares a plain-text password with a hashed password.
   * @returns Boolean indicating if they match.
   */
  async compare(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
