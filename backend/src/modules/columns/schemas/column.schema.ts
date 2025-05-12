import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Board } from '../../boards/schemas/board.schema';

export type ColumnDocument = Column & Document;

@Schema()
export class Column {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Board', required: true })
  boardId: Board;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Card' }], default: [] })
  cards: Types.ObjectId[];
}

export const ColumnSchema = SchemaFactory.createForClass(Column);
