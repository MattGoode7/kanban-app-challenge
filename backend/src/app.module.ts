import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { BoardsModule } from './modules/boards/boards.module';
import { ColumnsModule } from './modules/columns/columns.module';
import { CardsModule } from './modules/cards/cards.module';
import { UsersModule } from './modules/users/users.module';
import { GatewayModule } from './modules/gateways/gateway.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/kanban'),
    BoardsModule,
    ColumnsModule,
    CardsModule,
    UsersModule,
    GatewayModule,
    AuthModule,
  ]
})
export class AppModule {}

