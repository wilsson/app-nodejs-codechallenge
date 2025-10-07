import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetTransactionDTO {
  @IsUUID()
  id: string;
}

export class TransactionTypeDTO {
  @ApiProperty({ description: 'Tipo de la transacción', example: 1 })
  name: number;
}

export class TransactionStatusDTO {
  @ApiProperty({ description: 'Estado de la transacción', example: 'PENDING' })
  name: string;
}

export class TransactionResponseDTO {
  @ApiProperty({
    description: 'ID externo de la transacción',
    example: 'tx_123456',
  })
  transactionExternalId?: string;

  @ApiProperty({ type: () => TransactionTypeDTO })
  transactionType: TransactionTypeDTO;

  @ApiProperty({ type: () => TransactionStatusDTO })
  transactionStatus: TransactionStatusDTO;

  @ApiProperty({ description: 'Valor de la transacción', example: 100 })
  value: number;

  @ApiProperty({
    description: 'Fecha de creación de la transacción',
    example: new Date(),
  })
  createAt?: Date;
}
