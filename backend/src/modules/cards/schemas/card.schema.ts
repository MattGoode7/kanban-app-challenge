import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Column } from '../../columns/schemas/column.schema';

export type CardDocument = Card & Document;

@Schema()
export class Card {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Column', required: true })
  columnId: Column;
}

export const CardSchema = SchemaFactory.createForClass(Card);
