import { RegisterUserDTO } from '~/application/dtos/RegisterUserDTO';
import { User } from '~entities/User';

export interface IRegisterUserUseCase {
  execute(data: RegisterUserDTO): Promise<string>;
}

export interface IRegisterUserFromPendingUseCase {
  execute(email: string): Promise<Partial<User>>;
}
