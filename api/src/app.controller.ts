import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly prisma: PrismaService) { }

  @Get()
  async getHello(): Promise<string> {
    try {
      const res = await this.prisma.client.query('SELECT count(*) FROM "Workspace"');
      return `Backend Ready. Workspaces: ${res.rows[0].count}`;
    } catch (e) {
      return `Backend Error: ${e.message}`;
    }
  }
}
