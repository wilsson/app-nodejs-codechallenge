import { Logger } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { Semaphore } from 'async-mutex';
import { PaymentRejectedConsumerController } from './paymentRejectedConsumer.controller';
import { UpdateTransactionUseCase } from 'src/payments/useCases/updateTransaction/updateTransaction.usecase';

describe('PaymentRejectedConsumerController', () => {
  let controller: PaymentRejectedConsumerController;
  let mockUseCase: UpdateTransactionUseCase;

  beforeEach(() => {
    mockUseCase = { execute: jest.fn() } as any;
    controller = new PaymentRejectedConsumerController(mockUseCase);
  });

  it('should process the message successfully and commit offsets', async () => {
    const message = { id: '123', value: 100 };
    const commitOffsetsMock = jest.fn();
    const releaseMock = jest.fn();

    const context: any = {
      getMessage: () => ({ offset: '0' }),
      getTopic: () => 'payment.rejected',
      getPartition: () => 0,
      getConsumer: () => ({ commitOffsets: commitOffsetsMock }),
    };

    jest
      .spyOn(Semaphore.prototype, 'acquire')
      .mockResolvedValue([0, releaseMock]);

    await controller.handlePaymentCreated(message, context);

    expect(mockUseCase.execute).toHaveBeenCalledWith({
      id: '123',
      value: 100,
      status: TransactionStatus.REJECTED,
    });
    expect(commitOffsetsMock).toHaveBeenCalledWith([
      { topic: 'payment.rejected', partition: 0, offset: '1' },
    ]);
    expect(releaseMock).toHaveBeenCalled();
  });

  it('should log the error and release semaphore if use case fails', async () => {
    const message = { id: '123', value: 100 };
    const releaseMock = jest.fn();
    const loggerErrorSpy = jest
      .spyOn(controller.logger, 'error')
      .mockImplementation(jest.fn());

    const context: any = {
      getMessage: () => ({ offset: '0' }),
      getTopic: () => 'payment.rejected',
      getPartition: () => 0,
      getConsumer: () => ({ commitOffsets: jest.fn() }),
    };

    jest
      .spyOn(Semaphore.prototype, 'acquire')
      .mockResolvedValue([0, releaseMock]);
    jest.spyOn(mockUseCase, 'execute').mockRejectedValue(new Error('fail'));

    await controller.handlePaymentCreated(message, context);

    expect(loggerErrorSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(releaseMock).toHaveBeenCalled();
  });
});
