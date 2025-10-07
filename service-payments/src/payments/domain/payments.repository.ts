import { Transaction } from './payments';
import { UpdateTransactionDTO } from '../useCases/updateTransaction/updateTransaciton.dto';

export interface PaymentsRepository {
  saveTransaction(transaction: Transaction): Promise<Transaction>;

  getTransaction(id: string): Promise<Transaction | null>;

  getTransactionByIdempotencyKey(id: string): Promise<Transaction | null>;

  updateTransaction(dto: UpdateTransactionDTO): Promise<void>;
}
