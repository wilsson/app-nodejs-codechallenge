import { ApiProperty } from '@nestjs/swagger';
import { Escape, Trim } from 'class-sanitizer';
import { IsNumber, IsUUID } from 'class-validator';

/**
 * @obs
 * trim and escape are used to prevent xss attacks
 */

export class CreateTransactionDTO {
  @ApiProperty()
  @IsUUID()
  @Escape()
  @Trim()
  accountExternalIdDebit: string;

  @ApiProperty()
  @IsUUID()
  @Escape()
  @Trim()
  accountExternalIdCredit: string;

  @ApiProperty()
  @IsNumber()
  tranferTypeId: number;

  @ApiProperty()
  @IsNumber()
  value: number;
}
