import { Webinar } from '../../webinars/entities/webinar.entity';

export interface IWebinarRepository {
  create(webinar: Webinar): Promise<void>;
  findById(webinarId: string): Promise<Webinar | null>;
}
