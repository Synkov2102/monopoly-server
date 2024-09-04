import { Module } from '@nestjs/common';
import { ServiceGateway } from './service.gateway';
import { ServiceService } from './service.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from './schemas/game.chema';
import { Field, FieldSchema } from './schemas/field.chema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Game.name, schema: GameSchema },
      { name: Field.name, schema: FieldSchema },
    ]),
  ],
  providers: [ServiceGateway, ServiceService],
})
export class ServiceModule {}
