export class AlreadyThereException extends Error {
  constructor() {
    super('This person is already there');
    this.name = 'AlreadyThereException';
  }
}
