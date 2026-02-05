import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { WorksheetController } from './worksheet/worksheet.controller';
import { ResponseController } from './response/response.controller';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [],
  controllers: [AppController, WorksheetController, ResponseController, AuthController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
