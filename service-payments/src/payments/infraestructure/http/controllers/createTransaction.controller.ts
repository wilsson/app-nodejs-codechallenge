import {
  Body,
  ConflictException,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { TransactionAlreadyExistError } from 'src/payments/domain/errors';
import { CreateTransactionDTO } from 'src/payments/useCases/createTransaction/createTransaction.dto';
import { CreateTransactionUseCase } from 'src/payments/useCases/createTransaction/createTransaction.usecase';
import { TransactionAlreadyInProcessError } from 'src/payments/useCases/createTransaction/errors';

@Controller('/v1/payments')
export class CreateTransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
  ) {}

  @Post()
  async create(@Body() body: CreateTransactionDTO) {
    try {
      const result = await this.createTransactionUseCase.execute(body);
      return result;
    } catch (error) {
      if (error instanceof TransactionAlreadyExistError) {
        throw new ConflictException(error.message);
      }
      if (error instanceof TransactionAlreadyInProcessError) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}
