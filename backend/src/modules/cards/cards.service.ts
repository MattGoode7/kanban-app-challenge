import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
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
    try {
      if (!createCardDto.columnId) {
        throw new Error('columnId es requerido');
      }

      // Verificar que la columna existe
      const column = await this.columnModel.findById(createCardDto.columnId);
      if (!column) {
        throw new NotFoundException(`Column with id ${createCardDto.columnId} not found`);
      }

      if (!column.boardId) {
        throw new Error('La columna no tiene un tablero asociado');
      }

      const createdCard = new this.cardModel({
        ...createCardDto,
        columnId: new Types.ObjectId(createCardDto.columnId)
      });

      const savedCard = await createdCard.save();
      if (!savedCard) {
        throw new Error('No se pudo guardar la tarjeta');
      }

      // Actualizar la columna con la nueva tarjeta
      const updatedColumn = await this.columnModel.findByIdAndUpdate(
        createCardDto.columnId,
        { $push: { cards: savedCard._id } },
        { new: true }
      );

      if (!updatedColumn) {
        // Si no se pudo actualizar la columna, revertir la creación de la tarjeta
        await this.cardModel.findByIdAndDelete(savedCard._id);
        throw new Error('No se pudo actualizar la columna con la nueva tarjeta');
      }

      // Emitir evento de tarjeta creada
      await this.kanbanGateway.emitCardCreated(savedCard);

      return savedCard;
    } catch (error) {
      console.error('Error al crear tarjeta:', error);
      throw error;
    }
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

  async moveCard(
    cardId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    sourceIndex: number,
    destinationIndex: number,
  ): Promise<Card> {
    try {
      const card = await this.cardModel.findById(cardId);

      if (!card) {
        throw new Error('Tarjeta no encontrada');
      }

      // Actualizar la columna de la tarjeta
      const newColumnId = new Types.ObjectId(destinationColumnId);

      card.columnId = newColumnId;

      await card.save();
      await this.columnModel.updateOne(
        { _id: sourceColumnId },
        { $pull: { cards: new Types.ObjectId(cardId) } }
      );

      // Actualizar el orden en la columna de destino
      const destinationColumn = await this.columnModel.findById(destinationColumnId);

      if (!destinationColumn) {
        throw new Error('Columna de destino no encontrada');
      }

      const cards = [...destinationColumn.cards];
      const cardObjectId = new Types.ObjectId(cardId);

      cards.splice(destinationIndex, 0, cardObjectId);
      destinationColumn.cards = cards;
      await destinationColumn.save();

      return card;
    } catch (error) {
      throw error;
    }
  }

  async removeByColumn(columnId: string): Promise<void> {
    try {
      // Encontrar todas las tarjetas de la columna
      const cards = await this.cardModel.find({ columnId }).exec();
      
      // Eliminar cada tarjeta
      for (const card of cards) {
        const cardDoc = card as Document & { _id: Types.ObjectId };
        await this.remove(cardDoc._id.toString());
      }
    } catch (error) {
      throw error;
    }
  }
}
