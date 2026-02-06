import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
    public client: Client;

    async onModuleInit() {
        // Ensure env usage
        const url = process.env.DATABASE_URL;
        console.log('DB Connection:', url ? 'Using Environment Variable' : 'MISSING URL');

        this.client = new Client({
            connectionString: url,
        });
        await this.client.connect();
    }

    async onModuleDestroy() {
        await this.client.end();
    }
}
