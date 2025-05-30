import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Board, BoardDocument } from './schemas/board.schema';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';

@Injectable()
export class BoardsService {
  constructor(@InjectModel(Board.name) private boardModel: Model<BoardDocument>) {}

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    const newBoard = new this.boardModel(createBoardDto);
    return newBoard.save();
  }

  async findAll(): Promise<Board[]> {
    return this.boardModel
      .find()
      .populate({
        path: 'columns',
        populate: {
          path: 'cards'
        }
      })
      .exec();
  }

  async findOne(id: string): Promise<Board> {
    const board = await this.boardModel
      .findById(id)
      .populate({
        path: 'columns',
        populate: {
          path: 'cards'
        }
      });
    
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    return board;
  }

  async update(id: string, updateBoardDto: UpdateBoardDto): Promise<Board> {
    const updated = await this.boardModel
      .findByIdAndUpdate(id, updateBoardDto, { new: true })
      .populate({
        path: 'columns',
        populate: {
          path: 'cards'
        }
      });
    
    if (!updated) {
      throw new NotFoundException('Board not found');
    }
    return updated;
  }

  async remove(id: string): Promise<Board> {
    const deleted = await this.boardModel
      .findByIdAndDelete(id)
      .populate({
        path: 'columns',
        populate: {
          path: 'cards'
        }
      });
    
    if (!deleted) {
      throw new NotFoundException('Board not found');
    }
    return deleted;
  }

  async getBoardByColumnId(columnId: string): Promise<Board> {
    try {
      if (!columnId) {
        throw new Error('columnId es requerido');
      }

      const board = await this.boardModel
        .findOne({ 'columns': new Types.ObjectId(columnId) })
        .populate({
          path: 'columns',
          populate: {
            path: 'cards'
          }
        })
        .exec();

      if (!board) {
        throw new NotFoundException(`Board with column ${columnId} not found`);
      }

      return board;
    } catch (error) {
      console.error('Error in getBoardByColumnId:', {
        error: error.message,
        columnId,
        stack: error.stack
      });
      throw error;
    }
  }
}
