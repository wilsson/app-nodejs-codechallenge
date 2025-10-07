import { Module } from '@nestjs/common';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './utils/prisma';
import { RedisModule } from './common/redis.module';
import { KafkaModule } from './common/kafka.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
    }),
    RedisModule,
    KafkaModule,
    PrismaModule,
    PaymentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
