interface TransactionProps {
  id: string;
  value: number;
}

export class Transaction {
  /**
   * @improvement
   * You can also implement the value object pattern for each property.
   */
  id: string;
  value: number;

  constructor(request: TransactionProps) {
    this.id = request?.id;
    this.value = request?.value;
  }

  static create(request: TransactionProps): Transaction {
    return new Transaction({
      id: request?.id,
      value: request?.value,
    });
  }
}
