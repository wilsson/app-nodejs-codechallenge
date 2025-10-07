import { Inject } from '@nestjs/common';
import { Resolver, Query, Args } from '@nestjs/graphql';
import type { PaymentsRepository } from 'src/payments/domain/payments.repository';
import { TransactionType } from './transaction.type';

@Resolver(() => TransactionType)
export class PaymentsResolver {
  constructor(
    @Inject('PAYMENTS_REPOSITORY')
    private readonly repository: PaymentsRepository,
  ) {}

  @Query(() => TransactionType, { nullable: true })
  async transaction(@Args('id') id: string) {
    console.log('id', id);
    const s = await this.repository.getTransaction(id);
    console.log('sdsadsadasdid', s);
    return s;
  }
}
