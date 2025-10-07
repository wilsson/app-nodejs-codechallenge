import { Test, TestingModule } from '@nestjs/testing';
import { GetTransactionUseCase } from 'src/payments/useCases/getTransaction/getTransaction.usecase';
import { PaymentsRepository } from 'src/payments/domain/payments.repository';
import { TransactionNotFoundError } from 'src/payments/domain/errors';
import { PaymentsMapper } from 'src/payments/mappers/payments.mapper';
import { TransactionResponseDTO } from 'src/payments/useCases/getTransaction/getTransaction.dto';
import { TransactionStatus } from '@prisma/client';

describe('GetTransactionUseCase', () => {
  let useCase: GetTransactionUseCase;
  let mockRepository: Partial<PaymentsRepository>;

  beforeEach(async () => {
    mockRepository = {
      getTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTransactionUseCase,
        { provide: 'PAYMENTS_REPOSITORY', useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetTransactionUseCase>(GetTransactionUseCase);
  });

  const transactionId = 'uuid-123';
  const transactionEntity = {
    id: transactionId,
    tranferTypeId: 1,
    status: TransactionStatus.APPROVED,
    value: 100,
    createAt: new Date(),
    accountExternalIdCredit: '',
    accountExternalIdDebit: '',
  };

  it('should return mapped transaction when found', async () => {
    (mockRepository.getTransaction as jest.Mock).mockResolvedValue(
      transactionEntity,
    );

    const result: TransactionResponseDTO = (await useCase.execute(
      transactionId,
    )) as TransactionResponseDTO;

    expect(mockRepository.getTransaction).toHaveBeenCalledWith(transactionId);
    expect(result).toEqual(PaymentsMapper.toResponse(transactionEntity));
  });

  it('should throw TransactionNotFoundError when not found', async () => {
    (mockRepository.getTransaction as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute(transactionId)).rejects.toThrow(
      TransactionNotFoundError,
    );
    expect(mockRepository.getTransaction).toHaveBeenCalledWith(transactionId);
  });
});
