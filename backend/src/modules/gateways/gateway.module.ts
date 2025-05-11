// src/modules/gateways/gateway.module.ts
import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { KanbanGateway } from './kanban.gateway';

@Module({
  imports: [UsersModule],
  providers: [KanbanGateway],
  exports: [KanbanGateway],
})
export class GatewayModule {}
