import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Card, CardSchema } from './schemas/card.schema';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { Column, ColumnSchema } from '../columns/schemas/column.schema';
import { GatewayModule } from '../gateways/gateway.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Card.name, schema: CardSchema },
      { name: Column.name, schema: ColumnSchema },
    ]),
    GatewayModule,
  ],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
