import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FieldSchema = HydratedDocument<Field>;

@Schema({ versionKey: false })
export class Field {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  printedPrice: number;

  @Prop({ required: true })
  mortagePrice: number;

  @Prop({ required: true })
  buildingCosts: number;

  @Prop({ required: true })
  rent: number;

  @Prop({ required: true })
  monopolyRent: number;

  @Prop({ required: true })
  upgradeRent: [number, number, number, number, number];

  @Prop({ required: true })
  position: number;

  @Prop({ required: true })
  monopolyId: number;
}

export const FieldSchema = SchemaFactory.createForClass(Field);
