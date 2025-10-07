import { Module } from '@nestjs/common';
import { CreateTransactionController } from './infraestructure/http/controllers/createTransaction.controller';
import { CreateTransactionUseCase } from './useCases/createTransaction/createTransaction.usecase';
import { PostgresqlRepository } from './infraestructure/repositories/postgresql.repository';
import { PrismaService } from 'src/utils/prisma';
import { GetTransactionUseCase } from './useCases/getTransaction/getTransaction.usecase';
import { GetTransactionController } from './infraestructure/http/controllers/getTransaction.controller';
import { PaymentRejectedConsumerController } from './infraestructure/messaging/kafka/paymentRejectedConsumer.controller';
import { PaymentApprovedConsumerController } from './infraestructure/messaging/kafka/paymentApprovedConsumer.controller';
import { UpdateTransactionUseCase } from './useCases/updateTransaction/updateTransaction.usecase';
import { RedisLockRepository } from './infraestructure/cache/redis/redis.repository';
import { PaymentsResolver } from './infraestructure/graphql/payments.resolver';

const paymentsRepository = {
  provide: 'PAYMENTS_REPOSITORY',
  useFactory: (prisma: PrismaService) => {
    return new PostgresqlRepository(prisma);
  },
  inject: [PrismaService],
};

@Module({
  imports: [],
  providers: [
    PaymentsResolver,
    RedisLockRepository,
    paymentsRepository,
    CreateTransactionUseCase,
    GetTransactionUseCase,
    UpdateTransactionUseCase,
  ],
  controllers: [
    CreateTransactionController,
    GetTransactionController,
    PaymentApprovedConsumerController,
    PaymentRejectedConsumerController,
  ],
})
export class PaymentsModule {}
