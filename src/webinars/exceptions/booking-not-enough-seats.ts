export class BookingNotEnoughSeatsException extends Error {
  constructor() {
    super('This webinar is full');
    this.name = 'BookingNotEnoughSeatsException';
  }
}
