import { User } from '../../users/entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<void>;
}
