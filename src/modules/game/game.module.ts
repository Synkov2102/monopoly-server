import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from '../service/schemas/game.chema';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { Field, FieldSchema } from '../service/schemas/field.chema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Game.name, schema: GameSchema },
      { name: Field.name, schema: FieldSchema },
    ]),
  ],
  controllers: [],
  providers: [GameGateway, GameService],
})
export class GameModule {}
