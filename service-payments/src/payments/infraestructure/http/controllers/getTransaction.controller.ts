import {
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { TransactionNotFoundError } from 'src/payments/domain/errors';
import {
  GetTransactionDTO,
  TransactionResponseDTO,
} from 'src/payments/useCases/getTransaction/getTransaction.dto';
import { GetTransactionUseCase } from 'src/payments/useCases/getTransaction/getTransaction.usecase';

@Controller('/v1/payments')
export class GetTransactionController {
  constructor(private readonly useCase: GetTransactionUseCase) {}

  @ApiOkResponse({ type: TransactionResponseDTO })
  @Get('/:id')
  async create(@Param() params: GetTransactionDTO) {
    try {
      const id = params?.id;
      const result = await this.useCase.execute(id);
      return result;
    } catch (error) {
      if (error instanceof TransactionNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}
