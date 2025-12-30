import { nanoid } from 'nanoid';
import { IGenerateIdService } from '~service-interfaces/IGenerateIdService';

export class NanoIdService implements IGenerateIdService {
  generate(length: number): string {
    return length ? nanoid(length) : nanoid();
  }
}
