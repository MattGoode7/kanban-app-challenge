import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private socketToUser: Map<string, string> = new Map(); // Map<socketId, userId>

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return user.save();
  }

  async remove(socketId: string): Promise<User | null> {
    const userId = this.socketToUser.get(socketId);
    if (userId) {
      this.socketToUser.delete(socketId);
      return this.userModel.findById(userId).exec();
    }
    return null;
  }

  async addUser(socketId: string, userId: Types.ObjectId): Promise<void> {
    this.socketToUser.set(socketId, userId.toString());
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByName(name: string): Promise<User | null> {
    return this.userModel.findOne({ name }).exec();
  }
}
