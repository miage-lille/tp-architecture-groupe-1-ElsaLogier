import { IUserRepository } from 'src/users/ports/user-repository.interface';
import { IParticipationRepository } from 'src/webinars/ports/participation-repository.interface';
import { IWebinarRepository } from 'src/webinars/ports/webinar-repository.interface';
import { IMailer } from 'src/core/ports/mailer.interface';
import { InMemoryWebinarRepository } from '../adapters/webinar-repository.in-memory';
import { InMemoryParticipationRepository } from '../adapters/participation-repository.in-memory';
import { InMemoryUserRepository } from 'src/users/adapters/user-repository.in-memory';
import { InMemoryMailer } from 'src/core/adapters/in-memory-mailer';
import BookSeat from './book-seat';
import { User } from 'src/users/entities/user.entity';
import { Webinar } from '../entities/webinar.entity';
import { Participation } from '../entities/participation.entity';

describe('Feature: Book a seat', () => {
  let participationRepository: IParticipationRepository;
  let userRepository: IUserRepository;
  let webinarRepository: IWebinarRepository;
  let mailer: InMemoryMailer;
  let usecase: BookSeat;

  beforeEach(() => {
    participationRepository = new InMemoryParticipationRepository();
    userRepository = new InMemoryUserRepository();
    webinarRepository = new InMemoryWebinarRepository();
    mailer = new InMemoryMailer();
    usecase = new BookSeat(
      participationRepository,
      userRepository,
      webinarRepository,
      mailer,
    );

    createUsers();
    createWebinar();
    createParticipation();
  });

  function createUsers(): void {
    userRepository.create(
      new User({
        id: '1',
        email: 'toto@test.fr',
        password: 'toto',
      }),
    );

    userRepository.create(
      new User({
        id: '2',
        email: 'tata@test.fr',
        password: 'tata',
      }),
    );

    userRepository.create(
      new User({
        id: '3',
        email: 'tutu@test.fr',
        password: 'tutu',
      }),
    );

    userRepository.create(
      new User({
        id: '4',
        email: 'titi@test.fr',
        password: 'titi',
      }),
    );
  }

  function createWebinar(): void {
    webinarRepository.create(
      new Webinar({
        id: 'w1',
        title: 'Webinar 1',
        seats: 2,
        startDate: new Date('2024-01-10T10:00:00.000Z'),
        endDate: new Date('2024-01-10T11:00:00.000Z'),
        organizerId: '1',
      }),
    );
  }

  function createParticipation(): void {
    participationRepository.save(
      new Participation({
        userId: '2',
        webinarId: 'w1',
      }),
    );
  }

  describe('Scenario: happy path', () => {
    it('should end well and send email', async () => {
      let user = await userRepository.findById('1');
      expect(user).toBeTruthy();
      if (!user) return;

      const currentParticipations =
        await participationRepository.findByWebinarId('w1');

      const currentNbEmails = mailer.sentEmails.length;

      await usecase.execute({
        user: user,
        webinarId: 'w1',
      });

      const newParticipations =
        await participationRepository.findByWebinarId('w1');

      const newNbEmails = mailer.sentEmails.length;

      expect(newParticipations.length).toEqual(
        currentParticipations.length + 1,
      );

      expect(newNbEmails).toEqual(currentNbEmails + 1);
    });
  });

  describe('Scenario: bad-ending', () => {
    it('should fail because already booked', async () => {
      let user = await userRepository.findById('2');
      expect(user).toBeTruthy();
      if (!user) return;

      await expect(
        usecase.execute({
          user: user,
          webinarId: 'w1',
        }),
      ).rejects.toThrow('This person is already there');
    });

    it('should fail because not enough seats', async () => {
      participationRepository.save(
        new Participation({
          userId: '3',
          webinarId: 'w1',
        }),
      );

      const participations =
        await participationRepository.findByWebinarId('w1');

      const webinar = await webinarRepository.findById('w1');

      expect(webinar?.props.seats).toEqual(participations.length);

      let user = await userRepository.findById('4');
      expect(user).toBeTruthy();
      if (!user) return;

      await expect(
        usecase.execute({
          user: user,
          webinarId: 'w1',
        }),
      ).rejects.toThrow('This webinar is full');
    });

    it('should fail because webinar not exists', async () => {
      let user = await userRepository.findById('2');
      expect(user).toBeTruthy();
      if (!user) return;

      await expect(
        usecase.execute({
          user: user,
          webinarId: 'w2',
        }),
      ).rejects.toThrow('The webinar is not found');
    });
  });
});
