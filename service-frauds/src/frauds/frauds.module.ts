import { Module } from '@nestjs/common';
import { ValidationTransactionUseCase } from './application/validateTransaction.usecase';
import { PaymentCreatedConsumerController } from './infraestructure/messaging/kafka/paymentCreatedConsumer.controller';

@Module({
  providers: [ValidationTransactionUseCase],
  controllers: [PaymentCreatedConsumerController],
})
export class FraudsModule {}
