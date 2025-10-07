import { PostgresqlRepository } from 'src/payments/infraestructure/repositories/postgresql.repository';
import { PrismaService } from 'src/utils/prisma';
import { PaymentsMapper } from 'src/payments/mappers/payments.mapper';
import { Transaction } from 'src/payments/domain/payments';
import { UpdateTransactionDTO } from 'src/payments/useCases/updateTransaction/updateTransaciton.dto';

describe('PostgresqlRepository', () => {
  let repository: PostgresqlRepository;
  let prisma: Partial<PrismaService>;

  beforeEach(() => {
    prisma = {
      transaction: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    } as unknown as PrismaService;

    jest
      .spyOn(PaymentsMapper, 'toDomain')
      .mockImplementation((raw) => raw as unknown as Transaction);

    repository = new PostgresqlRepository(prisma as PrismaService);
  });

  describe('saveTransaction', () => {
    it('should call prisma.create and map to domain', async () => {
      const transaction = {
        accountExternalIdDebit: 'a',
        accountExternalIdCredit: 'b',
        value: 100,
        tranferTypeId: 1,
        status: 'PENDING',
      } as Transaction;
      (prisma.transaction!.create as jest.Mock).mockResolvedValue(transaction);

      const result = await repository.saveTransaction(transaction);

      expect(prisma.transaction!.create).toHaveBeenCalledWith({
        data: {
          account_external_id_debit: transaction.accountExternalIdDebit,
          account_external_id_credit: transaction.accountExternalIdCredit,
          value: transaction.value,
          tranfer_type_id: transaction.tranferTypeId,
          status: transaction.status,
        },
      });
      expect(PaymentsMapper.toDomain).toHaveBeenCalledWith(transaction);
      expect(result).toEqual(transaction);
    });
  });

  describe('getTransaction', () => {
    it('should return mapped transaction when found', async () => {
      const raw = { id: '123' };
      (prisma.transaction!.findUnique as jest.Mock).mockResolvedValue(raw);

      const result = await repository.getTransaction('123');

      expect(prisma.transaction!.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      expect(PaymentsMapper.toDomain).toHaveBeenCalledWith(raw);
      expect(result).toEqual(raw);
    });

    it('should return null when transaction not found', async () => {
      (prisma.transaction!.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.getTransaction('123');

      expect(result).toBeNull();
    });
  });

  describe('getTransactionByIdempotencyKey', () => {
    it('should return mapped transaction when found', async () => {
      const raw = { id: '123' };
      (prisma.transaction!.findFirst as jest.Mock).mockResolvedValue(raw);

      const result = await repository.getTransactionByIdempotencyKey('key-123');

      expect(prisma.transaction!.findFirst).toHaveBeenCalledWith({
        where: { account_external_id_debit: 'key-123' },
      });
      expect(PaymentsMapper.toDomain).toHaveBeenCalledWith(raw);
      expect(result).toEqual(raw);
    });

    it('should return null when not found', async () => {
      (prisma.transaction!.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.getTransactionByIdempotencyKey('key-123');

      expect(result).toBeNull();
    });
  });

  describe('updateTransaction', () => {
    it('should call prisma.update with correct parameters', async () => {
      const dto: UpdateTransactionDTO = {
        id: '123',
        status: 'REJECTED',
        value: 200,
      };

      await repository.updateTransaction(dto);

      expect(prisma.transaction!.update).toHaveBeenCalledWith({
        where: { id: dto.id },
        data: { status: dto.status },
      });
    });
  });
});
