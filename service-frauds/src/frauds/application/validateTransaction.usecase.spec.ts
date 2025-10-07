import { Test, TestingModule } from '@nestjs/testing';
import { ValidationTransactionUseCase } from './validateTransaction.usecase';
import { ClientKafka } from '@nestjs/microservices';
import { ValidationTransactionDTO } from './validateTransaction.dto';

describe('ValidationTransactionUseCase', () => {
  let useCase: ValidationTransactionUseCase;
  let kafkaMock: ClientKafka;

  beforeEach(async () => {
    kafkaMock = { emit: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidationTransactionUseCase,
        { provide: 'KAFKA_SERVICE', useValue: kafkaMock },
      ],
    }).compile();

    useCase = module.get<ValidationTransactionUseCase>(
      ValidationTransactionUseCase,
    );
  });

  it('should emit payment.approved when value <= 1000', () => {
    const dto: ValidationTransactionDTO = {
      id: 'id',

      accountExternalIdDebit: 'debit-1',
      accountExternalIdCredit: 'credit-1',
      tranferTypeId: 1,
      value: 500,
    };

    useCase.execute(dto);

    expect(kafkaMock.emit).toHaveBeenCalledWith(
      'payment.approved',
      expect.any(String),
    );
    expect(kafkaMock.emit).not.toHaveBeenCalledWith(
      'payment.rejected',
      expect.any(String),
    );
  });

  it('should emit payment.rejected when value > 1000', () => {
    const dto: ValidationTransactionDTO = {
      id: 'id',
      accountExternalIdDebit: 'debit-2',
      accountExternalIdCredit: 'credit-2',
      tranferTypeId: 2,
      value: 1500,
    };

    useCase.execute(dto);

    expect(kafkaMock.emit).toHaveBeenCalledWith(
      'payment.rejected',
      expect.any(String),
    );
    expect(kafkaMock.emit).not.toHaveBeenCalledWith(
      'payment.approved',
      expect.any(String),
    );
  });
});
