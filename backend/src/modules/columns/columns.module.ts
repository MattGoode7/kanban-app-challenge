import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Column, ColumnSchema } from './schemas/column.schema';
import { Board, BoardSchema } from '../boards/schemas/board.schema';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { GatewayModule } from '../gateways/gateway.module';
import { CardsModule } from '../cards/cards.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Column.name, schema: ColumnSchema },
      { name: Board.name, schema: BoardSchema },
    ]),
    forwardRef(() => GatewayModule),
    forwardRef(() => CardsModule),
  ],
  controllers: [ColumnsController],
  providers: [ColumnsService],
  exports: [ColumnsService],
})
export class ColumnsModule {}

