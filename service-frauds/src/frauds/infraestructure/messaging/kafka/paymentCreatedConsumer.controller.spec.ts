import { Semaphore } from 'async-mutex';
import { PaymentCreatedConsumerController } from './paymentCreatedConsumer.controller';
import { ValidationTransactionUseCase } from 'src/frauds/application/validateTransaction.usecase';

describe('PaymentCreatedConsumerController', () => {
  let controller: PaymentCreatedConsumerController;
  let mockUseCase: ValidationTransactionUseCase;

  beforeEach(() => {
    mockUseCase = { execute: jest.fn() } as any;
    controller = new PaymentCreatedConsumerController(mockUseCase);
  });

  it('should process the message successfully and commit offsets', async () => {
    const message = { id: 'abc', value: 100 };
    const commitOffsetsMock = jest.fn();
    const releaseMock = jest.fn();

    const context: any = {
      getMessage: () => ({ offset: '0' }),
      getTopic: () => 'payment.created',
      getPartition: () => 0,
      getConsumer: () => ({ commitOffsets: commitOffsetsMock }),
    };

    jest
      .spyOn(Semaphore.prototype, 'acquire')
      .mockResolvedValue([0, releaseMock]);

    await controller.handlePaymentCreated(message, context);

    expect(mockUseCase.execute).toHaveBeenCalledWith(message);
    expect(commitOffsetsMock).toHaveBeenCalledWith([
      { topic: 'payment.created', partition: 0, offset: '1' },
    ]);
    expect(releaseMock).toHaveBeenCalled();
  });

  it('should log the error and release semaphore if use case fails', async () => {
    const message = { id: 'abc', value: 100 };
    const releaseMock = jest.fn();
    const loggerErrorSpy = jest
      .spyOn(controller.logger, 'error')
      .mockImplementation(jest.fn());

    const context: any = {
      getMessage: () => ({ offset: '0' }),
      getTopic: () => 'payment.created',
      getPartition: () => 0,
      getConsumer: () => ({ commitOffsets: jest.fn() }),
    };

    jest
      .spyOn(Semaphore.prototype, 'acquire')
      .mockResolvedValue([0, releaseMock]);
    jest.spyOn(mockUseCase, 'execute').mockImplementation(() => {
      throw new Error('fail');
    });

    await controller.handlePaymentCreated(message, context);

    expect(loggerErrorSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(releaseMock).toHaveBeenCalled();
  });
});
