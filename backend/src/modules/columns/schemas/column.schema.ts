import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Card } from '../../cards/schemas/card.schema';

export type ColumnDocument = Column & Document;

@Schema()
export class Column {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Card' }] })
  cards: Card[]; 
}

export const ColumnSchema = SchemaFactory.createForClass(Column);
