import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Column } from '../../columns/schemas/column.schema';

export type BoardDocument = Board & Document;

@Schema()
export class Board {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Column' }] })
  columns: Column[]; // Referencias
}

export const BoardSchema = SchemaFactory.createForClass(Board);
