import { Webinar } from '../../webinars/entities/webinar.entity';
import { IWebinarRepository } from '../../webinars/ports/webinar-repository.interface';

export class InMemoryWebinarRepository implements IWebinarRepository {
  constructor(public database: Webinar[] = []) {}

  async findById(webinarId: string): Promise<Webinar | null> {
    let res = this.database.find((webinar) => webinar.props.id == webinarId);
    if (!res) {
      return null;
    }
    return res;
  }

  async create(webinar: Webinar): Promise<void> {
    this.database.push(webinar);
  }
}
