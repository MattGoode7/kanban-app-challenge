// src/gateway/kanban.gateway.ts
import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { UsersService } from '../users/users.service';
  import { BoardsService } from '../boards/boards.service';
  import { ColumnsService } from '../columns/columns.service';
  import { CardsService } from '../cards/cards.service';
  import { Card } from '../cards/schemas/card.schema';
  import { Column } from '../columns/schemas/column.schema';
  import { Board } from '../boards/schemas/board.schema';
  import { Inject, forwardRef } from '@nestjs/common';
  
  @WebSocketGateway({
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
      @Inject(forwardRef(() => ColumnsService))
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
        if (!data.columnId) {
          throw new Error('columnId es requerido');
        }

        const card = await this.cardsService.create({
          title: data.title,
          description: data.description,
          columnId: data.columnId,
        });

        if (!card) {
          throw new Error('No se pudo crear la tarjeta');
        }

        return card;
      } catch (error) {
        console.error('Error al crear tarjeta:', error);
        return { error: error.message };
      }
    }
  
    @SubscribeMessage('updateCard')
    async handleUpdateCard(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { cardId: string; updates: { title: string; description: string } }
    ) {
      try {
        const card = await this.cardsService.update(data.cardId, data.updates);
        if (!card) {
          throw new Error('No se pudo actualizar la tarjeta');
        }

        // Emitir evento de tarjeta actualizada
        await this.emitCardUpdated(card);

        return card;
      } catch (error) {
        console.error('Error al actualizar tarjeta:', error);
        return { error: error.message };
      }
    }
  
    @SubscribeMessage('deleteCard')
    async handleDeleteCard(
      @ConnectedSocket() client: Socket,
      @MessageBody() cardId: string
    ) {
      try {
        const card = await this.cardsService.findOne(cardId);
        if (!card) {
          throw new Error('Tarjeta no encontrada');
        }

        // Emitir evento de tarjeta eliminada
        await this.emitCardDeleted(cardId);

        // Eliminar la tarjeta
        await this.cardsService.remove(cardId);

        return { success: true };
      } catch (error) {
        console.error('Error al eliminar tarjeta:', error);
        return { error: error.message };
      }
    }
  
    @SubscribeMessage('createColumn')
    async handleCreateColumn(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { boardId: string; name: string }
    ) {
      try {
        const column = await this.columnsService.create({
          name: data.name,
          boardId: data.boardId
        });

        if (!column) {
          throw new Error('No se pudo crear la columna');
        }

        // Emitir evento de columna creada
        await this.emitColumnCreated(column);

        return column;
      } catch (error) {
        console.error('Error al crear columna:', error);
        return { error: error.message };
      }
    }
  
    @SubscribeMessage('updateColumn')
    async handleUpdateColumn(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { columnId: string; name: string }
    ) {
      try {
        const { columnId, name } = data;
        const column = await this.columnsService.update(columnId, { name });
        this.server.to(column.boardId.toString()).emit('columnUpdated', column);
      } catch (error) {
        client.emit('error', { message: error.message });
      }
    }
  
    @SubscribeMessage('deleteColumn')
    async handleDeleteColumn(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { columnId: string }
    ) {
      try {
        const { columnId } = data;
        const column = await this.columnsService.findOne(columnId);
        if (!column) {
          throw new Error('Columna no encontrada');
        }
        await this.columnsService.remove(columnId);
        this.server.to(column.boardId.toString()).emit('columnDeleted', columnId);
      } catch (error) {
        client.emit('error', { message: error.message });
      }
    }
  
    @SubscribeMessage('updateBoard')
    async handleUpdateBoard(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { boardId: string; updates: { name: string } }
    ) {
      try {
        const board = await this.boardsService.update(data.boardId, data.updates);
        if (board) {
          // Emitir el evento de actualización a todos los clientes conectados
          this.server.emit('boardUpdated', board);
        }
        return { board };
      } catch (error) {
        return { error: 'Error al actualizar el tablero' };
      }
    }
  
    @SubscribeMessage('deleteBoard')
    async handleDeleteBoard(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { boardId: string }
    ) {
      try {
        await this.boardsService.remove(data.boardId);
        // Emitir el evento de eliminación a todos los clientes conectados
        this.server.emit('boardDeleted', { boardId: data.boardId });
        return { success: true };
      } catch (error) {
        return { error: 'Error al eliminar el tablero' };
      }
    }
  
    @SubscribeMessage('createBoard')
    async handleCreateBoard(client: Socket, data: { name: string }) {
      try {
        if (!data.name) {
          throw new Error('El nombre del tablero es requerido');
        }

        const board = await this.boardsService.create({
          name: data.name.trim()
        });

        if (!board) {
          throw new Error('No se pudo crear el tablero');
        }

        // Unir al cliente al nuevo tablero
        await this.handleJoinBoard(client, board._id.toString());

        // Emitir el evento de tablero creado a todos los clientes
        this.server.emit('boardCreated', board);

        return board;
      } catch (error) {
        console.error('Error al crear tablero:', error);
        return { error: error.message };
      }
    }
  
    @SubscribeMessage('moveCard')
    async handleMoveCard(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: {
        cardId: string;
        sourceColumnId: string;
        destinationColumnId: string;
        sourceIndex: number;
        destinationIndex: number;
      },
    ) {
      try {
        const { cardId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex } = data;

        // Actualizar la posición de la tarjeta
        const updatedCard = await this.cardsService.moveCard(
          cardId,
          sourceColumnId,
          destinationColumnId,
          sourceIndex,
          destinationIndex
        );

        // Emitir el evento de actualización a todos los clientes en el tablero
        const board = await this.boardsService.getBoardByColumnId(destinationColumnId);
        if (board) {
          this.server.to(board._id.toString()).emit('cardMoved', {
            cardId,
            sourceColumnId,
            destinationColumnId,
            card: updatedCard
          });
        }

        return { success: true };
      } catch (error) {
        console.error('Error moving card:', error);
        return { error: 'Error al mover la tarjeta' };
      }
    }
  
    @SubscribeMessage('getBoards')
    async handleGetBoards(
      @ConnectedSocket() client: Socket
    ) {
      try {
        const boards = await this.boardsService.findAll();
        return { boards };
      } catch (error) {
        console.error('Error al obtener tableros:', error);
        return { error: error.message };
      }
    }
  
    // Métodos de emisión para los servicios
    async emitCardCreated(card: Card) {
      try {
        if (!card) {
          console.error('Error: card es undefined');
          return;
        }

        if (!card.columnId) {
          console.error('Error: columnId es undefined en la tarjeta', card);
          return;
        }

        const column = await this.columnsService.findOne(card.columnId.toString());
        if (!column) {
          console.error('Error: No se encontró la columna para la tarjeta', card);
          return;
        }

        if (!column.boardId) {
          console.error('Error: La columna no tiene un tablero asociado', column);
          return;
        }

        this.server.to(column.boardId.toString()).emit('cardCreated', card);
      } catch (error) {
        console.error('Error al emitir cardCreated:', error);
      }
    }
  
    async emitColumnCreated(column: Column) {
      this.server.to(column.boardId.toString()).emit('columnCreated', column);
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
  