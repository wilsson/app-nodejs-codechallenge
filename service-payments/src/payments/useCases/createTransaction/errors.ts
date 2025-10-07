export class TransactionAlreadyInProcessError extends Error {
  constructor(message = 'Transaction already in process') {
    super(message);
  }
}
