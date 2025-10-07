import { Transaction } from './payments';
import { TransactionStatus } from '@prisma/client';

describe('Transaction (Domain)', () => {
  const transactionProps = {
    id: 'txn-123',
    accountExternalIdDebit: 'acc-debit-123',
    accountExternalIdCredit: 'acc-credit-456',
    tranferTypeId: 1,
    value: 100,
    status: TransactionStatus.PENDING,
    createAt: new Date(),
  };

  it('should create a Transaction instance via constructor', () => {
    const transaction = new Transaction(transactionProps);

    expect(transaction).toBeInstanceOf(Transaction);
    expect(transaction.id).toBe(transactionProps.id);
    expect(transaction.accountExternalIdDebit).toBe(
      transactionProps.accountExternalIdDebit,
    );
    expect(transaction.accountExternalIdCredit).toBe(
      transactionProps.accountExternalIdCredit,
    );
    expect(transaction.tranferTypeId).toBe(transactionProps.tranferTypeId);
    expect(transaction.value).toBe(transactionProps.value);
    expect(transaction.status).toBe(transactionProps.status);
    expect(transaction.createAt).toBe(transactionProps.createAt);
  });

  it('should create a Transaction instance via static create method', () => {
    const transaction = Transaction.create(transactionProps);

    expect(transaction).toBeInstanceOf(Transaction);
    expect(transaction.id).toBe(transactionProps.id);
    expect(transaction.accountExternalIdDebit).toBe(
      transactionProps.accountExternalIdDebit,
    );
    expect(transaction.accountExternalIdCredit).toBe(
      transactionProps.accountExternalIdCredit,
    );
    expect(transaction.tranferTypeId).toBe(transactionProps.tranferTypeId);
    expect(transaction.value).toBe(transactionProps.value);
    expect(transaction.status).toBe(transactionProps.status);
    expect(transaction.createAt).toBe(transactionProps.createAt);
  });
});
