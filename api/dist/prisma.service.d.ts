import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client } from 'pg';
export declare class PrismaService implements OnModuleInit, OnModuleDestroy {
    client: Client;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
