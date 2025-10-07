import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateTransactionInput {
  @Field()
  accountExternalIdDebit: string;

  @Field()
  accountExternalIdCredit: string;

  @Field(() => Int)
  value: number;
}
