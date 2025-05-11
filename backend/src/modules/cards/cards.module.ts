import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Card, CardSchema } from './schemas/card.schema';
import { Column, ColumnSchema } from '../columns/schemas/column.schema';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { GatewayModule } from '../gateways/gateway.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Card.name, schema: CardSchema },
      { name: Column.name, schema: ColumnSchema },
    ]),
    forwardRef(() => GatewayModule)
  ],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
