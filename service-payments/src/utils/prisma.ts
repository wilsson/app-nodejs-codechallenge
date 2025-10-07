import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}

import { Global, Module } from '@nestjs/common';

@Global() // 👈 esto lo hace disponible globalmente
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 👈 permite que otros módulos lo usen
})
export class PrismaModule {}
