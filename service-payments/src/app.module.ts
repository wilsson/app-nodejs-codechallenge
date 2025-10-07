import { Module } from '@nestjs/common';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './utils/prisma';
import { RedisModule } from './common/redis.module';
import { KafkaModule } from './common/kafka.module';

@Module({
  imports: [RedisModule, KafkaModule, PrismaModule, PaymentsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
