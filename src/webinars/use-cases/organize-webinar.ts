import { Executable } from '../../shared/executable';
import { IWebinarRepository } from '../ports/webinar-repository.interface';
import { IIdGenerator } from '../../core/ports/id-generator.interface';
import { IDateGenerator } from '../../core/ports/date-generator.interface';
import { WebinarDatesTooSoonException } from '../exceptions/webinar-dates-too-soon';
import { WebinarTooManySeatsException } from '../exceptions/webinar-too-many-seats';
import { WebinarNotEnoughSeatsException } from '../exceptions/webinar-not-enough-seats';
import { Webinar } from '../entities/webinar.entity';

type Request = {
  userId: string;
  title: string;
  seats: number;
  startDate: Date;
  endDate: Date;
};

type Response = { id: string };

export class OrganizeWebinars implements Executable<Request, Response> {
  constructor(
    private readonly webinarRepository: IWebinarRepository,
    private readonly idGenerator: IIdGenerator,
    private readonly dateGenerator: IDateGenerator,
  ) {}

  async execute(data: Request) {
    const id = this.idGenerator.generate();

    const webinar = new Webinar({
      id: id,
      organizerId: data.userId,
      title: data.title,
      startDate: data.startDate,
      endDate: data.endDate,
      seats: data.seats,
    });
    if (webinar.isTooSoon(this.dateGenerator.now())) {
      throw new WebinarDatesTooSoonException();
    }
    if (webinar.hasTooManySeats()) {
      throw new WebinarTooManySeatsException();
    }

    if (webinar.hasNotEnoughSeats()) {
      throw new WebinarNotEnoughSeatsException();
    }

    await this.webinarRepository.create(webinar);

    return { id };
  }
}
