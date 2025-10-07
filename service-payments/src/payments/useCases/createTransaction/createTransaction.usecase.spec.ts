import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionUseCase } from 'src/payments/useCases/createTransaction/createTransaction.usecase';
import { RedisLockRepository } from 'src/payments/infraestructure/cache/redis/redis.repository';
import { TransactionAlreadyExistError } from 'src/payments/domain/errors';
import { ClientKafka } from '@nestjs/microservices';
import { PaymentsRepository } from 'src/payments/domain/payments.repository';
import { CreateTransactionDTO } from 'src/payments/useCases/createTransaction/createTransaction.dto';
import { TransactionAlreadyInProcessError } from './errors';

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let mockRepository: Partial<PaymentsRepository>;
  let mockRedis: Partial<RedisLockRepository>;
  let mockKafka: Partial<ClientKafka>;

  beforeEach(async () => {
    mockRepository = {
      getTransactionByIdempotencyKey: jest.fn(),
      saveTransaction: jest.fn(),
    };

    mockRedis = {
      acquireLock: jest.fn(),
      releaseLock: jest.fn(),
    };

    mockKafka = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionUseCase,
        { provide: 'PAYMENTS_REPOSITORY', useValue: mockRepository },
        { provide: 'KAFKA_SERVICE', useValue: mockKafka },
        { provide: RedisLockRepository, useValue: mockRedis },
      ],
    }).compile();

    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
  });

  const dto: CreateTransactionDTO = {
    accountExternalIdDebit: 'uuid-debit',
    accountExternalIdCredit: 'uuid-credit',
    tranferTypeId: 1,
    value: 100,
  };

  it('should create a transaction successfully', async () => {
    (mockRedis.acquireLock as jest.Mock).mockResolvedValue(true);
    (
      mockRepository.getTransactionByIdempotencyKey as jest.Mock
    ).mockResolvedValue(null);
    (mockRepository.saveTransaction as jest.Mock).mockImplementation(
      (tx) => tx,
    );

    await useCase.execute(dto);

    expect(mockRedis.acquireLock).toHaveBeenCalledWith(
      dto.accountExternalIdDebit,
      5,
    );
    expect(mockRepository.getTransactionByIdempotencyKey).toHaveBeenCalledWith(
      dto.accountExternalIdDebit,
    );
    expect(mockRepository.saveTransaction).toHaveBeenCalled();
    expect(mockKafka.emit).toHaveBeenCalledWith(
      'payment.created',
      expect.any(String),
    );
    expect(mockRedis.releaseLock).toHaveBeenCalledWith(
      dto.accountExternalIdDebit,
    );
  });

  it('should throw TransactionAlreadyInProcessError if lock cannot be acquired', async () => {
    (mockRedis.acquireLock as jest.Mock).mockResolvedValue(false);

    await expect(useCase.execute(dto)).rejects.toThrow(
      TransactionAlreadyInProcessError,
    );
    expect(mockRedis.releaseLock).not.toHaveBeenCalled();
  });

  it('should throw TransactionAlreadyExistError if transaction already exists', async () => {
    (mockRedis.acquireLock as jest.Mock).mockResolvedValue(true);
    (
      mockRepository.getTransactionByIdempotencyKey as jest.Mock
    ).mockResolvedValue({ id: 'existing' });

    await expect(useCase.execute(dto)).rejects.toThrow(
      TransactionAlreadyExistError,
    );
    expect(mockRedis.releaseLock).toHaveBeenCalledWith(
      dto.accountExternalIdDebit,
    );
  });

  it('should always release lock even if save throws', async () => {
    (mockRedis.acquireLock as jest.Mock).mockResolvedValue(true);
    (
      mockRepository.getTransactionByIdempotencyKey as jest.Mock
    ).mockResolvedValue(null);
    (mockRepository.saveTransaction as jest.Mock).mockRejectedValue(
      new Error('DB error'),
    );

    await expect(useCase.execute(dto)).rejects.toThrow('DB error');
    expect(mockRedis.releaseLock).toHaveBeenCalledWith(
      dto.accountExternalIdDebit,
    );
  });
});
