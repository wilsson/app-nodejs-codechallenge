import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
        },
        consumer: {
          groupId: 'fraud-group',
        },
      },
    },
  );

  console.log('⏳ Conectando con Kafka...');
  await app.listen();
  console.log('✅ Kafka consumer listening for events...');
  // await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
