import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateTransactionDTO } from './createTransaction.dto';
import type { PaymentsRepository } from 'src/payments/domain/payments.repository';
import { TransactionStatus } from '@prisma/client';
import { Transaction } from 'src/payments/domain/payments';
import { ClientKafka } from '@nestjs/microservices';
import { RedisLockRepository } from 'src/payments/infraestructure/cache/redis/redis.repository';
import { TransactionAlreadyExistError } from 'src/payments/domain/errors';
import { TransactionAlreadyInProcessError } from './errors';

@Injectable()
export class CreateTransactionUseCase {
  logger: Logger = new Logger(CreateTransactionUseCase.name);

  constructor(
    @Inject('PAYMENTS_REPOSITORY')
    private readonly repository: PaymentsRepository,

    @Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka,

    private readonly redisLockRepository: RedisLockRepository,
  ) {}

  async execute(request: CreateTransactionDTO) {
    this.logger.log('create transaction', request);

    /**
     * @desc
     * We will use accountExternalIdDebit as an idempotency key
     */
    const idempotencyKey = request?.accountExternalIdDebit;
    const locked = await this.redisLockRepository.acquireLock(
      idempotencyKey,
      5,
    );
    if (!locked) throw new TransactionAlreadyInProcessError();

    try {
      /**
       * @desc
       * validation for duplicate payments with the same idempotency key
       */
      const transactionFound =
        await this.repository.getTransactionByIdempotencyKey(idempotencyKey);

      if (transactionFound) throw new TransactionAlreadyExistError();

      const transaction = Transaction.create({
        accountExternalIdDebit: request?.accountExternalIdDebit,
        accountExternalIdCredit: request?.accountExternalIdCredit,
        tranferTypeId: request?.tranferTypeId,
        value: request?.value,
        status: TransactionStatus.PENDING,
      });

      const saveTransaction =
        await this.repository.saveTransaction(transaction);

      this.kafka.emit('payment.created', JSON.stringify(saveTransaction));
    } finally {
      await this.redisLockRepository.releaseLock(
        request?.accountExternalIdDebit,
      );
    }
  }
}
