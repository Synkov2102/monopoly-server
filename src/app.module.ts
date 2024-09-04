import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppGateway } from './app.gateway';
import { ServiceModule } from './modules/service/service.module';
import { GameModule } from './modules/game/game.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), MongooseModule.forRoot(process.env.DATABASE_HOST), ServiceModule, GameModule],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule { }
