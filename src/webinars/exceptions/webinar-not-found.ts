export class WebinarNotFoundException extends Error {
  constructor() {
    super('The webinar is not found');
    this.name = 'WebinarNotFoundException';
  }
}
