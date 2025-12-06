import { IHashService } from '~domain-services/IHashService';
import bcrypt from 'bcrypt';

export class HashService implements IHashService {
  async hash(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 10);

    return hashedPassword;
  }

  async compare(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
