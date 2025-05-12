import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CardsService } from './cards.service';
import { Card, CardSchema } from './schemas/card.schema';
import { Column, ColumnSchema } from '../columns/schemas/column.schema';
import { GatewayModule } from '../gateways/gateway.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Card.name, schema: CardSchema },
      { name: Column.name, schema: ColumnSchema }
    ]),
    forwardRef(() => GatewayModule),
  ],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
