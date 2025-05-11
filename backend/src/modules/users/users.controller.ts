import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/user.dto';
import { User } from './schemas/user.schema';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @WebSocketServer()
  server: Server;

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }
}
