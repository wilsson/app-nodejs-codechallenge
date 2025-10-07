import { Module } from '@nestjs/common';
import { FraudsModule } from './frauds/frauds.module';
import { KafkaModule } from './common/kafka.module';

@Module({
  imports: [KafkaModule, FraudsModule],
  providers: [],
})
export class AppModule {}
