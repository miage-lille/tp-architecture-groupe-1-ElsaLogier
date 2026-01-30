import { Email, IMailer } from 'src/core/ports/mailer.interface';
import { Executable } from 'src/shared/executable';
import { User } from 'src/users/entities/user.entity';
import { IUserRepository } from 'src/users/ports/user-repository.interface';
import { IParticipationRepository } from 'src/webinars/ports/participation-repository.interface';
import { IWebinarRepository } from 'src/webinars/ports/webinar-repository.interface';
import { Participation } from 'src/webinars/entities/participation.entity';
import { AlreadyThereException } from 'src/webinars/exceptions/booking-already-there';
import { BookingNotEnoughSeatsException } from 'src/webinars/exceptions/booking-not-enough-seats';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found';

type Request = {
  webinarId: string;
  user: User;
};
type Response = void;

export class BookSeat implements Executable<Request, Response> {
  constructor(
    private readonly participationRepository: IParticipationRepository,
    private readonly userRepository: IUserRepository,
    private readonly webinarRepository: IWebinarRepository,
    private readonly mailer: IMailer,
  ) {}
  async execute({ webinarId, user }: Request): Promise<Response> {
    const bodyMail = 'Une nouvelle inscription a été enregistrée';
    const subjectMail = 'Nouvelle inscription !!';

    // Je crée une nouvelle participation
    const participation = new Participation({
      webinarId: webinarId,
      userId: user.props.id,
    });

    // Je vais chercher le webinaire et la participation
    const webPromise = this.webinarRepository.findById(webinarId);
    const participationsPromise =
      this.participationRepository.findByWebinarId(webinarId);

    const web = await webPromise;
    if (!web) {
      throw new WebinarNotFoundException();
    }
    // Je vais chercher de quoi préparer mon mail
    const idOrga = web.props.organizerId;
    const orga = await this.userRepository.findById(idOrga);
    const mailOrga = orga?.props.email;

    const participations = await participationsPromise;

    if (
      participations.some(
        (p) =>
          p.props.userId === participation.props.userId &&
          p.props.webinarId === participation.props.webinarId,
      )
    ) {
      throw new AlreadyThereException();
    }

    if (participations.length == web.props.seats) {
      throw new BookingNotEnoughSeatsException();
    }

    await this.participationRepository.save(participation);

    if (mailOrga) {
      const mailInscription: Email = {
        to: mailOrga,
        subject: subjectMail,
        body: bodyMail,
      };
      this.mailer.send(mailInscription);
    }
  }
}

export default BookSeat;
