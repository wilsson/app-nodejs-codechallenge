import { Inject, Injectable, Logger } from '@nestjs/common';
import type { PaymentsRepository } from 'src/payments/domain/payments.repository';
import { UpdateTransactionDTO } from './updateTransaciton.dto';

@Injectable()
export class UpdateTransactionUseCase {
  logger: Logger = new Logger(UpdateTransactionUseCase.name);

  constructor(
    @Inject('PAYMENTS_REPOSITORY')
    private readonly repository: PaymentsRepository,
  ) {}

  async execute(dto: UpdateTransactionDTO) {
    await this.repository.updateTransaction(dto);
  }
}
