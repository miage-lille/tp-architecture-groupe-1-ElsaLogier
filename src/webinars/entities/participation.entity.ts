import { Entity } from '../../shared/entity';

type Props = {
  userId: string;
  webinarId: string;
};

export class Participation extends Entity<Props> {}
