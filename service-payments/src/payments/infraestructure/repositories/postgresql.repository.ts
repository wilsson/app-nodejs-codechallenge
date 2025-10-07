import { TransactionStatus } from '@prisma/client';
import { Transaction } from 'src/payments/domain/payments';
import { PaymentsRepository } from 'src/payments/domain/payments.repository';
import { PaymentsMapper } from 'src/payments/mappers/payments.mapper';
import { UpdateTransactionDTO } from 'src/payments/useCases/updateTransaction/updateTransaciton.dto';
import { PrismaService } from 'src/utils/prisma';

export class PostgresqlRepository implements PaymentsRepository {
  constructor(private prisma: PrismaService) {}

  async saveTransaction(transaction: Transaction): Promise<Transaction> {
    const result = await this.prisma.transaction.create({
      data: {
        account_external_id_debit: transaction?.accountExternalIdDebit,
        account_external_id_credit: transaction?.accountExternalIdCredit,
        value: transaction?.value,
        tranfer_type_id: transaction?.tranferTypeId,
        events: {
          create: {
            status: TransactionStatus.PENDING,
          },
        },
      },
    });
    return PaymentsMapper.toDomain(result);
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    const result = await this.prisma.transaction.findUnique({
      where: {
        id,
      },
      include: {
        events: {
          orderBy: {
            created_at: 'desc',
          },
          take: 1,
        },
      },
    });
    if (!result) return null;
    return PaymentsMapper.toDomain(result);
  }

  async getTransactionByIdempotencyKey(
    id: string,
  ): Promise<Transaction | null> {
    const result = await this.prisma.transaction.findFirst({
      where: {
        account_external_id_debit: id,
      },
      include: {
        events: {
          orderBy: {
            created_at: 'desc',
          },
          take: 1,
        },
      },
    });
    if (!result) return null;
    return PaymentsMapper.toDomain(result);
  }

  async updateTransaction(dto: UpdateTransactionDTO): Promise<void> {
    await this.prisma.eventStore.create({
      data: {
        transaction_id: dto?.id,
        status: dto?.status,
      },
    });
  }
}
