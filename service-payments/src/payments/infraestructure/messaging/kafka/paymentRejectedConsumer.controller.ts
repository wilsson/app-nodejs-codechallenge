import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import { TransactionStatus } from '@prisma/client';
import { Semaphore } from 'async-mutex';
import { UpdateTransactionUseCase } from 'src/payments/useCases/updateTransaction/updateTransaction.usecase';

const MAX_CONCURRENT_EVENTS = 100;
const semaphore = new Semaphore(MAX_CONCURRENT_EVENTS);

@Controller()
export class PaymentRejectedConsumerController {
  logger: Logger = new Logger(PaymentRejectedConsumerController.name);

  constructor(private readonly useCase: UpdateTransactionUseCase) {}

  @EventPattern('payment.rejected')
  async handlePaymentCreated(
    @Payload() message: { id: string; value: number },
    @Ctx() context: KafkaContext,
  ) {
    const [_, release] = await semaphore.acquire();

    try {
      const originalMessage = context.getMessage();
      const topic = context.getTopic();
      const partition = context.getPartition();
      const offset = originalMessage.offset;

      this.logger.log('processing event', {
        message,
        partition,
        offset,
        topic,
      });

      await this.useCase.execute({
        id: message?.id,
        value: message?.value,
        status: TransactionStatus.REJECTED,
      });

      const consumer = context.getConsumer();
      await consumer.commitOffsets([
        {
          topic: context.getTopic(),
          partition,
          offset: (Number(offset) + 1).toString(),
        },
      ]);
    } catch (error) {
      this.logger.error(error);
    } finally {
      release();
    }
  }
}
