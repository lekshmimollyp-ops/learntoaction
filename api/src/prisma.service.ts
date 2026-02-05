import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
    public client: Client;

    async onModuleInit() {
        this.client = new Client({
            connectionString: 'postgresql://postgres:password@127.0.0.1:5432/learntoaction',
        });
        await this.client.connect();
    }

    async onModuleDestroy() {
        await this.client.end();
    }
}
