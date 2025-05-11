import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { BoardsModule } from './modules/boards/boards.module';
import { ColumnsModule } from './modules/columns/columns.module';
import { CardsModule } from './modules/cards/cards.module';
import { UsersModule } from './modules/users/users.module';
import { GatewayModule } from './modules/gateways/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Carga .env automáticamente
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    BoardsModule,
    ColumnsModule,
    CardsModule,
    UsersModule,
    GatewayModule,
  ]
})
export class AppModule {}

