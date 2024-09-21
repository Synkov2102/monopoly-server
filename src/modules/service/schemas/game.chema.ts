import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type GameDocument = HydratedDocument<Game>;

interface IField {
  position: number;
  monopolyId: number;
  monopolied: boolean;
  level: number;
  ownerId: mongoose.Types.ObjectId | null;
  mortage: boolean;
}

export interface IPlayer {
  _id: mongoose.Types.ObjectId;
  color: string;
  currentPosition: number;
  money: number;
}

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
