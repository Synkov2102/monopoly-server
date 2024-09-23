import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { IField, IPlayer } from 'src/types/types';

export type GameDocument = HydratedDocument<Game>;

@Schema({ versionKey: false })
export class Game {
  @Prop({ required: true })
  fields: IField[];

  @Prop({ required: true })
  players: IPlayer[];

  @Prop()
  currentMove: mongoose.Types.ObjectId;

  @Prop({ required: true })
  creator: mongoose.Types.ObjectId;

  @Prop()
  action: string;

  @Prop()
  status: 'preparation' | 'inProgress' | 'ended';
}

export const GameSchema = SchemaFactory.createForClass(Game);
