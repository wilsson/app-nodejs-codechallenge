import { TransactionStatus } from '@prisma/client';

export interface UpdateTransactionDTO {
  id: string;
  value: number;
  status: TransactionStatus;
}
