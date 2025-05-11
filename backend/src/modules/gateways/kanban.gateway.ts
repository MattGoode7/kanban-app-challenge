// src/gateway/kanban.gateway.ts

import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { UsersService } from '../users/users.service';
  import { BoardsService } from '../boards/boards.service';
  import { ColumnsService } from '../columns/columns.service';
  import { CardsService } from '../cards/cards.service';
  import { CreateUserDto } from '../users/dto/user.dto';
  import * as bcrypt from 'bcrypt';
  import { Types } from 'mongoose';
  import { Card } from '../cards/schemas/card.schema';
  import { Column } from '../columns/schemas/column.schema';
  
  @WebSocketGateway({
    cors: {
      origin: 'http://localhost:5174',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })
  export class KanbanGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    constructor(
      private readonly usersService: UsersService,
      private readonly boardsService: BoardsService,
      private readonly columnsService: ColumnsService,
      private readonly cardsService: CardsService,
    ) {
      console.log('✅ KanbanGateway constructor llamado');
    }
  
    async handleConnection(client: Socket) {
      console.log(`Cliente conectado: ${client.id}`);
    }
  
    async handleDisconnect(client: Socket) {
      console.log(`Cliente desconectado: ${client.id}`);
      const user = await this.usersService.remove(client.id);
      if (user) {
        this.server.emit('userDisconnected', { name: user.name });
      }
    }
  
    @SubscribeMessage('join')
    async handleJoin(client: Socket, data: { username: string }) {
      try {
        let user = await this.usersService.findByName(data.username);
  
        if (!user) {
          // Generar una contraseña aleatoria para usuarios creados vía socket
          const randomPassword = Math.random().toString(36).slice(-8);
          const hashedPassword = await bcrypt.hash(randomPassword, 10);
          
          const createUserDto: CreateUserDto = {
            name: data.username,
            password: hashedPassword
          };
          
          user = await this.usersService.create(createUserDto);
        }
  
        if (user._id) {
          await this.usersService.addUser(client.id, new Types.ObjectId(user._id.toString()));
          this.server.emit('userJoined', { name: user.name });
          return { success: true, user };
        } else {
          throw new Error('Error al crear usuario: ID no generado');
        }
      } catch (error) {
        console.error('Error en handleJoin:', error);
        return { success: false, error: error.message };
      }
    }
  
    @SubscribeMessage('createCard')
    async handleCreateCard(client: Socket, data: { columnId: string; title: string; description: string }) {
      try {
        const card = await this.cardsService.create({
          title: data.title,
          description: data.description,
          columnId: data.columnId,
        });
        this.server.emit('cardCreated', card);
        return card;
      } catch (error) {
        console.error('Error al crear tarjeta:', error);
        return { error: error.message };
      }
    }
  
    @SubscribeMessage('moveCard')
    async handleMoveCard(client: Socket, data: { cardId: string; sourceColumnId: string; targetColumnId: string; newIndex: number }) {
      try {
        const card = await this.cardsService.update(data.cardId, {
          columnId: data.targetColumnId
        });
        this.server.emit('cardMoved', card);
        return card;
      } catch (error) {
        console.error('Error al mover tarjeta:', error);
        return { error: error.message };
      }
    }
  
    @SubscribeMessage('createColumn')
    async handleCreateColumn(client: Socket, data: { boardId: string; title: string }) {
      try {
        const column = await this.columnsService.create({
          title: data.title,
          boardId: data.boardId,
        });
        this.server.emit('columnCreated', column);
        return column;
      } catch (error) {
        console.error('Error al crear columna:', error);
        return { error: error.message };
      }
    }
  
    // Métodos de emisión para los servicios
    emitCardCreated(card: Card) {
      this.server.emit('cardCreated', card);
    }
  
    emitCardMoved(data: { cardId: string; toColumnId: string }) {
      this.server.emit('cardMoved', data);
    }
  
    emitColumnCreated(column: Column) {
      this.server.emit('columnCreated', column);
    }
  
    private notifyClients(event: string, data: any) {
      this.server.emit(event, data);
    }
  }
  