import { Test, TestingModule } from '@nestjs/testing';
import { GetTransactionController } from './getTransaction.controller';
import { GetTransactionUseCase } from 'src/payments/useCases/getTransaction/getTransaction.usecase';
import { TransactionNotFoundError } from 'src/payments/domain/errors';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GetTransactionDTO } from 'src/payments/useCases/getTransaction/getTransaction.dto';

describe('GetTransactionController', () => {
  let controller: GetTransactionController;
  let useCase: GetTransactionUseCase;

  const mockUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetTransactionController],
      providers: [
        {
          provide: GetTransactionUseCase,
          useValue: mockUseCase,
        },
      ],
    }).compile();

    controller = module.get<GetTransactionController>(GetTransactionController);
    useCase = module.get<GetTransactionUseCase>(GetTransactionUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the transaction when use case succeeds', async () => {
    const transaction = { id: '123', value: 100 };
    mockUseCase.execute.mockResolvedValue(transaction);

    const dto: GetTransactionDTO = { id: '123' };
    const result = await controller.create(dto);

    expect(result).toEqual(transaction);
    expect(mockUseCase.execute).toHaveBeenCalledWith('123');
  });

  it('should throw NotFoundException if transaction is not found', async () => {
    mockUseCase.execute.mockRejectedValue(new TransactionNotFoundError());

    const dto: GetTransactionDTO = { id: '999' };

    await expect(controller.create(dto)).rejects.toThrow(NotFoundException);
    await expect(controller.create(dto)).rejects.toThrow();
  });

  it('should throw InternalServerErrorException for other errors', async () => {
    mockUseCase.execute.mockRejectedValue(new Error('Unexpected'));

    const dto: GetTransactionDTO = { id: '123' };

    await expect(controller.create(dto)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
