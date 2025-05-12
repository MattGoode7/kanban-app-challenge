// src/modules/gateways/gateway.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { KanbanGateway } from './kanban.gateway';
import { UsersModule } from '../users/users.module';
import { BoardsModule } from '../boards/boards.module';
import { ColumnsModule } from '../columns/columns.module';
import { CardsModule } from '../cards/cards.module';

@Module({
  imports: [
    UsersModule,
    BoardsModule,
    forwardRef(() => ColumnsModule),
    forwardRef(() => CardsModule),
  ],
  providers: [KanbanGateway],
  exports: [KanbanGateway],
})
export class GatewayModule {}
