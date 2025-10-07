import { PaymentsMapper } from './payments.mapper';
import { Transaction } from '../domain/payments';
import { TransactionStatus } from '@prisma/client';
import type {
  EventStore,
  Transaction as TransactionDatabase,
} from '@prisma/client';
import { TransactionResponseDTO } from '../useCases/getTransaction/getTransaction.dto';

type TransactionWithEvents = TransactionDatabase & {
  events?: EventStore[];
};

describe('PaymentsMapper', () => {
  const now = new Date();
  const rawDatabaseTransaction: TransactionWithEvents = {
    id: 'id',
    tranfer_type_id: 1,
    account_external_id_debit: 'acc-debit-123',
    account_external_id_credit: 'acc-credit-123',
    value: 100,
    events: [
      {
        id: 'event-1',
        transaction_id: 'id',
        status: TransactionStatus.APPROVED,
        created_at: now,
        updated_at: now,
      },
    ],
    created_at: new Date(),
    updated_at: new Date(),
  };

  it('should map raw database transaction to domain entity', () => {
    const domainTransaction: Transaction = PaymentsMapper.toDomain(
      rawDatabaseTransaction,
    );

    expect(domainTransaction).toBeInstanceOf(Transaction);
    expect(domainTransaction.id).toBe(rawDatabaseTransaction.id);
    expect(domainTransaction.tranferTypeId).toBe(
      rawDatabaseTransaction.tranfer_type_id,
    );
    expect(domainTransaction.accountExternalIdDebit).toBe(
      rawDatabaseTransaction.account_external_id_debit,
    );
    expect(domainTransaction.accountExternalIdCredit).toBe(
      rawDatabaseTransaction.account_external_id_credit,
    );
    expect(domainTransaction.value).toBe(rawDatabaseTransaction.value);
    expect(domainTransaction.status).toBe(
      rawDatabaseTransaction.events![0].status,
    );
    expect(domainTransaction.createAt).toBe(rawDatabaseTransaction.created_at);
  });

  it('should map domain entity to response DTO', () => {
    const domainTransaction = Transaction.create({
      id: rawDatabaseTransaction.id,
      tranferTypeId: rawDatabaseTransaction.tranfer_type_id,
      accountExternalIdDebit: rawDatabaseTransaction.account_external_id_debit,
      accountExternalIdCredit:
        rawDatabaseTransaction.account_external_id_credit,
      value: rawDatabaseTransaction.value,
      status: rawDatabaseTransaction.events![0].status,
      createAt: rawDatabaseTransaction.created_at,
    });

    const responseDTO: TransactionResponseDTO =
      PaymentsMapper.toResponse(domainTransaction);

    expect(responseDTO.transactionExternalId).toBe(domainTransaction.id);
    expect(responseDTO.transactionType.name).toBe(
      domainTransaction.tranferTypeId,
    );
    expect(responseDTO.transactionStatus.name).toBe(domainTransaction.status);
    expect(responseDTO.value).toBe(domainTransaction.value);
    expect(responseDTO.createAt).toBe(domainTransaction.createAt);
  });
});
