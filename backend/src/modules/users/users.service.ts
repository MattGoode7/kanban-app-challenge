import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  private users: Map<string, User> = new Map();

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    console.log('✅ UsersService constructor llamado');
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  remove(socketId: string): User | undefined {
    const user = this.users.get(socketId);
    if (user) {
      this.users.delete(socketId);
    }
    return user;
  }

  addUser(socketId: string, user: User): void {
    this.users.set(socketId, user);
  }

  findAll(): User[] {
    return Array.from(this.users.values());
  }

  findOne(id: string): User | undefined {
    return this.users.get(id);
  }
}
