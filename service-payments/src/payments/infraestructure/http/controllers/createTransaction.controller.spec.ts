import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionController } from 'src/payments/infraestructure/http/controllers/createTransaction.controller';
import { CreateTransactionUseCase } from 'src/payments/useCases/createTransaction/createTransaction.usecase';
import { CreateTransactionDTO } from 'src/payments/useCases/createTransaction/createTransaction.dto';
import { TransactionAlreadyExistError } from 'src/payments/domain/errors';
import { TransactionAlreadyInProcessError } from 'src/payments/useCases/createTransaction/errors';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';

describe('CreateTransactionController', () => {
  let controller: CreateTransactionController;
  let mockUseCase: Partial<CreateTransactionUseCase>;

  beforeEach(async () => {
    mockUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateTransactionController],
      providers: [
        {
          provide: CreateTransactionUseCase,
          useValue: mockUseCase,
        },
      ],
    }).compile();

    controller = module.get<CreateTransactionController>(CreateTransactionController);
  });

  it('should call use case with correct DTO', async () => {
    const dto: CreateTransactionDTO = {
      accountExternalIdDebit: 'uuid-1',
      accountExternalIdCredit: 'uuid-2',
      tranferTypeId: 1,
      value: 100,
    };

    await controller.create(dto);

    expect(mockUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('should throw ConflictException if TransactionAlreadyExistError is thrown', async () => {
    const dto: CreateTransactionDTO = {
      accountExternalIdDebit: 'uuid-1',
      accountExternalIdCredit: 'uuid-2',
      tranferTypeId: 1,
      value: 100,
    };

    (mockUseCase.execute as jest.Mock).mockRejectedValue(
      new TransactionAlreadyExistError(),
    );

    await expect(controller.create(dto)).rejects.toThrow(ConflictException);
  });

  it('should throw ConflictException if TransactionAlreadyInProcessError is thrown', async () => {
    const dto: CreateTransactionDTO = {
      accountExternalIdDebit: 'uuid-1',
      accountExternalIdCredit: 'uuid-2',
      tranferTypeId: 1,
      value: 100,
    };

    (mockUseCase.execute as jest.Mock).mockRejectedValue(
      new TransactionAlreadyInProcessError(),
    );

    await expect(controller.create(dto)).rejects.toThrow(ConflictException);
  });

  it('should throw InternalServerErrorException for unknown errors', async () => {
    const dto: CreateTransactionDTO = {
      accountExternalIdDebit: 'uuid-1',
      accountExternalIdCredit: 'uuid-2',
      tranferTypeId: 1,
      value: 100,
    };

    (mockUseCase.execute as jest.Mock).mockRejectedValue(new Error('unknown'));

    await expect(controller.create(dto)).rejects.toThrow(InternalServerErrorException);
  });
});