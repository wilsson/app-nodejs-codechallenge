import { EventStore, Transaction as TransactionDatabase } from '@prisma/client';
import { Transaction } from '../domain/payments';
import { TransactionResponseDTO } from '../useCases/getTransaction/getTransaction.dto';

type TransactionWithEvents = TransactionDatabase & {
  events?: EventStore[];
};

export class PaymentsMapper {
  static toDomain(raw: TransactionWithEvents): Transaction {
    console.log('raw', raw);
    const lastEvent = raw.events?.[0];

    return Transaction.create({
      id: raw?.id,
      tranferTypeId: raw?.tranfer_type_id,
      accountExternalIdCredit: raw?.account_external_id_credit,
      accountExternalIdDebit: raw?.account_external_id_debit,
      value: raw?.value,
      createAt: raw?.created_at,
      status: lastEvent?.status!,
    });
  }

  static toResponse(raw: Transaction): TransactionResponseDTO {
    return {
      transactionExternalId: raw?.id,
      transactionType: {
        name: raw?.tranferTypeId,
      },
      transactionStatus: {
        name: raw?.status,
      },
      value: raw?.value,
      createAt: raw?.createAt,
    };
  }
}
