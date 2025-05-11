import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Card, CardDocument } from './schemas/card.schema';
import { Column, ColumnDocument } from '../columns/schemas/column.schema';
import { CreateCardDto, UpdateCardDto } from './dto/card.dto';
import { KanbanGateway } from '../gateways/kanban.gateway';

@Injectable()
export class CardsService {
  constructor(
    @InjectModel(Card.name) private cardModel: Model<CardDocument>,
    @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
    @Inject(forwardRef(() => KanbanGateway))
    private readonly kanbanGateway: KanbanGateway,
  ) {}

  async create(createCardDto: CreateCardDto): Promise<Card> {
    const createdCard = new this.cardModel(createCardDto);
    const savedCard = await createdCard.save();

    // Actualizar la columna con la nueva tarjeta
    await this.columnModel.findByIdAndUpdate(
      createCardDto.columnId,
      { $push: { cards: savedCard._id } },
      { new: true }
    );

    // Emitir evento de tarjeta creada
    await this.kanbanGateway.emitCardCreated(savedCard);

    return savedCard;
  }

  async findAll(): Promise<Card[]> {
    return this.cardModel.find().exec();
  }

  async findOne(id: string): Promise<Card> {
    const card = await this.cardModel.findById(id).exec();
    if (!card) {
      throw new NotFoundException(`Card with id ${id} not found`);
    }
    return card;
  }

  async findByColumn(columnId: string): Promise<Card[]> {
    return this.cardModel.find({ columnId }).exec();
  }

  async update(id: string, updateCardDto: UpdateCardDto): Promise<Card> {
    const card = await this.cardModel.findById(id);
    if (!card) {
      throw new NotFoundException(`Card with id ${id} not found`);
    }

    // Si se está cambiando la columna
    if (updateCardDto.columnId && updateCardDto.columnId !== card.columnId.toString()) {
      // Remover la tarjeta de la columna anterior
      await this.columnModel.findByIdAndUpdate(
        card.columnId,
        { $pull: { cards: id } }
      );

      // Agregar la tarjeta a la nueva columna
      await this.columnModel.findByIdAndUpdate(
        updateCardDto.columnId,
        { $push: { cards: id } }
      );
    }

    const updatedCard = await this.cardModel
      .findByIdAndUpdate(id, updateCardDto, { new: true })
      .exec();

    if (!updatedCard) {
      throw new NotFoundException(`Card with id ${id} not found`);
    }

    // Emitir evento de tarjeta actualizada
    await this.kanbanGateway.emitCardUpdated(updatedCard);

    return updatedCard;
  }

  async remove(id: string): Promise<void> {
    const card = await this.cardModel.findById(id);
    if (!card) {
      throw new NotFoundException(`Card with id ${id} not found`);
    }

    // Remover la tarjeta de la columna
    await this.columnModel.findByIdAndUpdate(
      card.columnId,
      { $pull: { cards: id } }
    );

    // Emitir evento de tarjeta eliminada
    await this.kanbanGateway.emitCardDeleted(id);

    // Eliminar la tarjeta
    await this.cardModel.findByIdAndDelete(id);
  }
}
