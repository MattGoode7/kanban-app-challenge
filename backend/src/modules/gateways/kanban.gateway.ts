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
  import { Board } from '../boards/schemas/board.schema';
  import { UpdateCardDto } from '../cards/dto/card.dto';
  import { Inject, forwardRef } from '@nestjs/common';
  
  @WebSocketGateway({
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })
  export class KanbanGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    private userRooms: Map<string, string[]> = new Map();
  
    constructor(
      private readonly usersService: UsersService,
      private readonly boardsService: BoardsService,
      private readonly columnsService: ColumnsService,
      @Inject(forwardRef(() => CardsService))
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
        this.server.emit('userLeft', { name: user.name });
      }
    }
  
    @SubscribeMessage('join_board')
    async handleJoinBoard(client: Socket, boardId: string) {
      try {
        console.log(`Cliente ${client.id} uniéndose al tablero ${boardId}`);
        client.join(boardId);
        
        // Guardar la sala en el mapa de salas del usuario
        const userRooms = this.userRooms.get(client.id) || [];
        if (!userRooms.includes(boardId)) {
          userRooms.push(boardId);
          this.userRooms.set(client.id, userRooms);
        }
  
        // Obtener y enviar el estado actual del tablero
        const board = await this.boardsService.findOne(boardId);
        if (board) {
          client.emit('board_updated', board);
        }
      } catch (error) {
        console.error('Error al unirse al tablero:', error);
        return { error: error.message };
      }
    }
  
    @SubscribeMessage('leave_board')
    async handleLeaveBoard(client: Socket, boardId: string) {
      try {
        console.log(`Cliente ${client.id} dejando el tablero ${boardId}`);
        client.leave(boardId);
        
        // Eliminar la sala del mapa de salas del usuario
        const userRooms = this.userRooms.get(client.id) || [];
        const updatedRooms = userRooms.filter(room => room !== boardId);
        this.userRooms.set(client.id, updatedRooms);
      } catch (error) {
        console.error('Error al dejar el tablero:', error);
        return { error: error.message };
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
  
        // Obtener la columna para saber a qué tablero pertenece
        const column = await this.columnsService.findOne(data.columnId);
        if (column) {
          this.server.to(column.boardId.toString()).emit('cardCreated', card);
        }
        return card;
      } catch (error) {
        console.error('Error al crear tarjeta:', error);
        return { error: error.message };
      }
    }
  
    @SubscribeMessage('updateCard')
    async handleUpdateCard(client: Socket, data: { cardId: string; updates: UpdateCardDto }) {
      try {
        const card = await this.cardsService.update(data.cardId, data.updates);
        if (card) {
          const column = await this.columnsService.findOne(card.columnId.toString());
          if (column) {
            this.server.to(column.boardId.toString()).emit('cardUpdated', card);
          }
        }
        return card;
      } catch (error) {
        console.error('Error al actualizar tarjeta:', error);
        return { error: error.message };
      }
    }
  
    @SubscribeMessage('deleteCard')
    async handleDeleteCard(client: Socket, cardId: string) {
      try {
        const card = await this.cardsService.findOne(cardId);
        if (card) {
          const column = await this.columnsService.findOne(card.columnId.toString());
          if (column) {
            await this.cardsService.remove(cardId);
            this.server.to(column.boardId.toString()).emit('cardDeleted', cardId);
          }
        }
        return { success: true };
      } catch (error) {
        console.error('Error al eliminar tarjeta:', error);
        return { error: error.message };
      }
    }
  
    @SubscribeMessage('createColumn')
    async handleCreateColumn(client: Socket, data: { boardId: string; name: string }) {
      try {
        const column = await this.columnsService.create({
          name: data.name,
          boardId: data.boardId,
        });
        this.server.to(data.boardId).emit('columnCreated', column);
        return column;
      } catch (error) {
        console.error('Error al crear columna:', error);
        return { error: error.message };
      }
    }
  
    @SubscribeMessage('updateColumn')
    async handleUpdateColumn(client: Socket, data: { columnId: string; updates: Partial<Column> }) {
      try {
        const column = await this.columnsService.update(data.columnId, data.updates);
        if (column) {
          this.server.to(column.boardId.toString()).emit('columnUpdated', column);
        }
        return column;
      } catch (error) {
        console.error('Error al actualizar columna:', error);
        return { error: error.message };
      }
    }
  
    @SubscribeMessage('deleteColumn')
    async handleDeleteColumn(client: Socket, columnId: string) {
      try {
        const column = await this.columnsService.findOne(columnId);
        if (column) {
          await this.columnsService.remove(columnId);
          this.server.to(column.boardId.toString()).emit('columnDeleted', columnId);
        }
        return { success: true };
      } catch (error) {
        console.error('Error al eliminar columna:', error);
        return { error: error.message };
      }
    }
  
    @SubscribeMessage('updateBoard')
    async handleUpdateBoard(client: Socket, data: { boardId: string; updates: Partial<Board> }) {
      try {
        const board = await this.boardsService.update(data.boardId, data.updates);
        if (board) {
          this.server.to(data.boardId).emit('board_updated', board);
        }
        return board;
      } catch (error) {
        console.error('Error al actualizar tablero:', error);
        return { error: error.message };
      }
    }
  
    // Métodos de emisión para los servicios
    async emitCardCreated(card: Card) {
      const column = await this.columnsService.findOne(card.columnId.toString());
      if (column) {
        this.server.to(column.boardId.toString()).emit('cardCreated', card);
      }
    }
  
    async emitCardUpdated(card: Card) {
      const column = await this.columnsService.findOne(card.columnId.toString());
      if (column) {
        this.server.to(column.boardId.toString()).emit('cardUpdated', card);
      }
    }
  
    async emitCardDeleted(cardId: string) {
      const card = await this.cardsService.findOne(cardId);
      if (card) {
        const column = await this.columnsService.findOne(card.columnId.toString());
        if (column) {
          this.server.to(column.boardId.toString()).emit('cardDeleted', cardId);
        }
      }
    }
  
    async emitColumnCreated(column: Column) {
      this.server.to(column.boardId.toString()).emit('columnCreated', column);
    }
  
    async emitColumnUpdated(column: Column) {
      this.server.to(column.boardId.toString()).emit('columnUpdated', column);
    }
  
    async emitColumnDeleted(columnId: string) {
      const column = await this.columnsService.findOne(columnId);
      if (column) {
        this.server.to(column.boardId.toString()).emit('columnDeleted', columnId);
      }
    }
  
    async emitBoardUpdated(board: Board) {
      this.server.to(board._id.toString()).emit('board_updated', board);
    }
  }
  