import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class TransactionType {
  @Field()
  id: string;

  @Field()
  accountExternalIdDebit: string;

  @Field()
  accountExternalIdCredit: string;

  @Field(() => Int)
  value: number;

  @Field()
  status: string;

  @Field()
  createAt: Date;
}
