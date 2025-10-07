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
        status: transaction?.status,
      },
    });
    return PaymentsMapper.toDomain(result);
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    const result = await this.prisma.transaction.findUnique({
      where: {
        id,
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
    });
    if (!result) return null;
    return PaymentsMapper.toDomain(result);
  }

  async updateTransaction(dto: UpdateTransactionDTO): Promise<void> {
    await this.prisma.transaction.update({
      where: {
        id: dto?.id,
      },
      data: {
        status: dto?.status,
      },
    });
  }
}
