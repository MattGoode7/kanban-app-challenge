import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Column, ColumnDocument } from './schemas/column.schema';
import { Board, BoardDocument } from '../boards/schemas/board.schema';
import { Model, Types } from 'mongoose';
import { CreateColumnDto, UpdateColumnDto } from './dto/column.dto';
import { CardsService } from '../cards/cards.service';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    private cardsService: CardsService
  ) {}

  async create(createColumnDto: CreateColumnDto): Promise<Column> {
    const column = new this.columnModel(createColumnDto);
    const savedColumn = await column.save();

    // Actualizar el tablero para incluir la nueva columna
    await this.boardModel.findByIdAndUpdate(
      createColumnDto.boardId,
      { $push: { columns: savedColumn._id } },
      { new: true }
    );

    return savedColumn;
  }

  async findAll(): Promise<Column[]> {
    return this.columnModel.find().populate('cards').exec();
  }

  async findByBoard(boardId: string): Promise<Column[]> {
    return this.columnModel.find({ boardId }).populate('cards').exec();
  }

  async findOne(id: string): Promise<Column> {
    const column = await this.columnModel.findById(id).populate('cards').exec();
    if (!column) {
      throw new NotFoundException(`Column with id ${id} not found`);
    }
    return column;
  }

  async update(id: string, updateDto: UpdateColumnDto): Promise<Column> {
    const updated = await this.columnModel.findByIdAndUpdate(id, updateDto, {
      new: true,
    }).populate('cards');

    if (!updated) {
      throw new NotFoundException(`Column with id ${id} not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    try {
      // Primero obtenemos la columna para saber su boardId
      const column = await this.columnModel.findById(id);
      if (!column) {
        throw new NotFoundException(`Column with id ${id} not found`);
      }

      // Eliminamos todas las tarjetas asociadas a la columna
      await this.cardsService.removeByColumn(id);

      // Eliminamos la columna
      await this.columnModel.findByIdAndDelete(id);
    } catch (error) {
      console.error('Error al eliminar columna:', error);
      throw error;
    }
  }
}
