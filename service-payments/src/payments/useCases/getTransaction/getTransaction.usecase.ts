import { Inject, Injectable, Logger } from '@nestjs/common';
import { TransactionNotFoundError } from 'src/payments/domain/errors';
import type { PaymentsRepository } from 'src/payments/domain/payments.repository';
import { PaymentsMapper } from 'src/payments/mappers/payments.mapper';
import { TransactionResponseDTO } from './getTransaction.dto';

@Injectable()
export class GetTransactionUseCase {
  logger: Logger = new Logger(GetTransactionUseCase.name);

  constructor(
    @Inject('PAYMENTS_REPOSITORY')
    private readonly repository: PaymentsRepository,
  ) {}

  async execute(id: string): Promise<TransactionResponseDTO | null> {
    const transaction = await this.repository.getTransaction(id);
    if (!transaction) throw new TransactionNotFoundError();
    return PaymentsMapper.toResponse(transaction);
  }
}
