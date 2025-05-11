// src/modules/gateways/gateway.module.ts
import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { BoardsModule } from '../boards/boards.module';
import { ColumnsModule } from '../columns/columns.module';
import { CardsModule } from '../cards/cards.module';
import { KanbanGateway } from './kanban.gateway';

@Module({
  imports: [
    UsersModule,
    BoardsModule,
    ColumnsModule,
    CardsModule
  ],
  providers: [KanbanGateway],
  exports: [KanbanGateway],
})
export class GatewayModule {}
