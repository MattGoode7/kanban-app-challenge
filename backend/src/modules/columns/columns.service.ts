import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Column, ColumnDocument } from './schemas/column.schema';
import { Model } from 'mongoose';
import { CreateColumnDto, UpdateColumnDto } from './dto/column.dto';
import { KanbanGateway } from '../gateways/kanban.gateway';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
    private readonly kanbanGateway: KanbanGateway,
  ) {}

  async create(createColumnDto: CreateColumnDto): Promise<Column> {
    const column = new this.columnModel(createColumnDto);
    const saved = await column.save();

    this.kanbanGateway.emitColumnCreated(saved);
    return saved;
  }

  async findAll(): Promise<Column[]> {
    return this.columnModel.find().exec();
  }

  async update(id: string, updateDto: UpdateColumnDto): Promise<Column> {
    const updated = await this.columnModel.findByIdAndUpdate(id, updateDto, {
      new: true,
    });

    if (!updated) {
      throw new NotFoundException(`Column with id ${id} not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<Column> {
    const deleted = await this.columnModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Column with id ${id} not found`);
    }
    return deleted;
  }
}
