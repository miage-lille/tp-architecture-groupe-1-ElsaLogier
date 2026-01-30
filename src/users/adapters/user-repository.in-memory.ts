import { User } from '../entities/user.entity';
import { IUserRepository } from '../ports/user-repository.interface';

export class InMemoryUserRepository implements IUserRepository {
  constructor(public database: User[] = []) {}

  async findById(id: string): Promise<User | null> {
    const user = this.database.find((user) => {
      let res = user.props.id === id;
      if (!res) return null;
      return res;
    });

    if (!user) return null;
    return user;
  }

  async create(user: User): Promise<void> {
    this.database.push(user);
  }
}
