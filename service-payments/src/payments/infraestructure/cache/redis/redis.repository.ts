import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisLockRepository {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
  }

  async acquireLock(key: string, ttl: number): Promise<boolean> {
    const result = await this.client.set(key, 'locked', 'PX', ttl, 'NX');
    console.log('result', result);
    return result === 'OK';
  }

  async releaseLock(key: string): Promise<void> {
    await this.client.del(key);
  }
}
