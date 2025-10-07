import { Inject, Injectable, Logger } from '@nestjs/common';
import { ValidationTransactionDTO } from './validateTransaction.dto';
import { Transaction } from '../domain/payments';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class ValidationTransactionUseCase {
  logger: Logger = new Logger(ValidationTransactionUseCase.name);

  constructor(@Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka) {}

  execute(request: ValidationTransactionDTO) {
    this.logger.log('validation transaction', request);

    const transaction = Transaction.create(request);

    if (transaction?.value > 1000) {
      this.kafka.emit('payment.rejected', JSON.stringify(transaction));
      return;
    }
    this.kafka.emit('payment.approved', JSON.stringify(transaction));
  }
}
