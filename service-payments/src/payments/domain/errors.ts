export class TransactionAlreadyExistError extends Error {
  constructor(message = 'Double payment') {
    super(message);
  }
}

export class TransactionNotFoundError extends Error {
  constructor(message = 'Transaction not found') {
    super(message);
  }
}
