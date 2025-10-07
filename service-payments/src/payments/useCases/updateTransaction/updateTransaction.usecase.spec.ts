import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTransactionUseCase } from 'src/payments/useCases/updateTransaction/updateTransaction.usecase';
import { PaymentsRepository } from 'src/payments/domain/payments.repository';
import { UpdateTransactionDTO } from 'src/payments/useCases/updateTransaction/updateTransaciton.dto';

describe('UpdateTransactionUseCase', () => {
  let useCase: UpdateTransactionUseCase;
  let mockRepository: Partial<PaymentsRepository>;

  beforeEach(async () => {
    mockRepository = {
      updateTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTransactionUseCase,
        { provide: 'PAYMENTS_REPOSITORY', useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<UpdateTransactionUseCase>(UpdateTransactionUseCase);
  });

  it('should call repository.updateTransaction with the given DTO', async () => {
    const dto: UpdateTransactionDTO = {
      id: 'uuid-123',
      value: 200,
      status: 'REJECTED',
    };

    await useCase.execute(dto);

    expect(mockRepository.updateTransaction).toHaveBeenCalledWith(dto);
  });

  it('should propagate errors from repository', async () => {
    const dto: UpdateTransactionDTO = {
      id: 'uuid-123',
      value: 200,
      status: 'REJECTED',
    };

    (mockRepository.updateTransaction as jest.Mock).mockRejectedValue(
      new Error('DB error'),
    );

    await expect(useCase.execute(dto)).rejects.toThrow('DB error');
  });
});
