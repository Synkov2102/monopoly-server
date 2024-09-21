import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FieldDocument = HydratedDocument<Field>;

@Schema({ versionKey: false })
export class Field {
  @Prop({ required: true })
  name: string;

  @Prop()
  printedPrice: number;

  @Prop()
  mortagePrice: number;

  @Prop()
  buildingCosts: number;

  @Prop()
  rent: number;

  @Prop()
  monopolyRent: number;

  @Prop()
  upgradeRent: [number, number, number, number, number];

  @Prop({ required: true })
  position: number;

  @Prop()
  monopolyId: number;

  @Prop({ required: true })
  type: string;
}

export const FieldSchema = SchemaFactory.createForClass(Field);
