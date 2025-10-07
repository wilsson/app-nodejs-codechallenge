import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTransactionUseCase } from 'src/payments/useCases/updateTransaction/updateTransaction.usecase';
import { TransactionStatus } from '@prisma/client';
import { Semaphore } from 'async-mutex';
import { PaymentApprovedConsumerController } from './paymentApprovedConsumer.controller';

describe('PaymentApprovedConsumerController', () => {
  let controller: PaymentApprovedConsumerController;
  let mockUseCase: UpdateTransactionUseCase;

  beforeEach(async () => {
    mockUseCase = { execute: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentApprovedConsumerController],
      providers: [{ provide: UpdateTransactionUseCase, useValue: mockUseCase }],
    }).compile();

    controller = module.get<PaymentApprovedConsumerController>(
      PaymentApprovedConsumerController,
    );
  });

  it('should process a Kafka message and call use case', async () => {
    const mockMessage = { id: 'txn-123', value: 100 };
    const mockOffset = '10';
    const mockPartition = 0;
    const mockTopic = 'payment.approved';
    const releaseMock = jest.fn();

    // Mock del semaphore para que devuelva release
    jest
      .spyOn(Semaphore.prototype, 'acquire')
      .mockResolvedValue([0, releaseMock]);

    const mockConsumer = { commitOffsets: jest.fn() };
    const mockContext = {
      getMessage: jest.fn(() => ({ offset: mockOffset })),
      getTopic: jest.fn(() => mockTopic),
      getPartition: jest.fn(() => mockPartition),
      getConsumer: jest.fn(() => mockConsumer),
    } as any;

    await controller.handlePaymentCreated(mockMessage, mockContext);

    expect(mockUseCase.execute).toHaveBeenCalledWith({
      id: mockMessage.id,
      value: mockMessage.value,
      status: TransactionStatus.APPROVED,
    });

    expect(mockConsumer.commitOffsets).toHaveBeenCalledWith([
      { topic: mockTopic, partition: mockPartition, offset: '11' },
    ]);

    expect(releaseMock).toHaveBeenCalled();
  });

  it('should release semaphore even if use case throws', async () => {
    const mockMessage = { id: 'txn-123', value: 100 };
    const releaseMock = jest.fn();

    jest
      .spyOn(Semaphore.prototype, 'acquire')
      .mockResolvedValue([0, releaseMock]);

    const mockContext = {
      getMessage: jest.fn(() => ({ offset: '10' })),
      getTopic: jest.fn(() => 'payment.approved'),
      getPartition: jest.fn(() => 0),
      getConsumer: jest.fn(() => ({ commitOffsets: jest.fn() })),
    } as any;

    mockUseCase.execute = jest.fn(() => {
      throw new Error('fail');
    });

    await controller
      .handlePaymentCreated(mockMessage, mockContext)
      .catch(() => {});

    expect(releaseMock).toHaveBeenCalled();
  });
});
