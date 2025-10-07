import { TransactionStatus } from '@prisma/client';

interface TransactionProps {
  id?: string;
  createAt?: Date;
  accountExternalIdDebit: string;
  accountExternalIdCredit: string;
  tranferTypeId: number;
  value: number;
  status: TransactionStatus;
}

export class Transaction {
  /**
   * @improvement
   * You can also implement the value object pattern for each property.
   */
  id?: string;
  createAt?: Date;
  accountExternalIdDebit: string;
  accountExternalIdCredit: string;
  tranferTypeId: number;
  value: number;
  status: TransactionStatus;

  constructor(request: TransactionProps) {
    this.id = request?.id;
    this.accountExternalIdDebit = request?.accountExternalIdDebit;
    this.accountExternalIdCredit = request?.accountExternalIdCredit;
    this.tranferTypeId = request?.tranferTypeId;
    this.value = request?.value;
    this.status = request?.status;
    this.createAt = request?.createAt;
  }

  static create(request: TransactionProps): Transaction {
    return new Transaction({
      id: request?.id,
      accountExternalIdDebit: request?.accountExternalIdDebit,
      accountExternalIdCredit: request?.accountExternalIdCredit,
      tranferTypeId: request?.tranferTypeId,
      value: request?.value,
      status: request?.status,
      createAt: request?.createAt,
    });
  }
}
