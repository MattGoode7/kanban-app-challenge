import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Column, ColumnSchema } from './schemas/column.schema';
import { Board, BoardSchema } from '../boards/schemas/board.schema';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { GatewayModule } from '../gateways/gateway.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Column.name, schema: ColumnSchema },
      { name: Board.name, schema: BoardSchema },
    ]),
    GatewayModule, // Importa el módulo de Gateway para acceder a KanbanGateway
  ],
  controllers: [ColumnsController],
  providers: [ColumnsService],
})
export class ColumnsModule {}

