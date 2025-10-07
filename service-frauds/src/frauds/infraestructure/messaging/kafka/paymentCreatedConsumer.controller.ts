import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import { ValidationTransactionUseCase } from 'src/frauds/application/validateTransaction.usecase';
import { Semaphore } from 'async-mutex';

const MAX_CONCURRENT_EVENTS = 100;
const semaphore = new Semaphore(MAX_CONCURRENT_EVENTS);

@Controller()
export class PaymentCreatedConsumerController {
  logger: Logger = new Logger(PaymentCreatedConsumerController.name);

  constructor(private readonly useCase: ValidationTransactionUseCase) {}

  @EventPattern('payment.created')
  async handlePaymentCreated(
    @Payload() message: any,
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

      this.useCase.execute(message);

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
