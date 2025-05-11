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
  
  @WebSocketGateway({
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })
  export class KanbanGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    constructor(private usersService: UsersService) {
      console.log('✅ UsersService injected');
      console.log('usersService class:', this.usersService.constructor.name);
    }
  
    async handleConnection(client: Socket) {
      console.log(`Client connected: ${client.id}`);
    }
  
    async handleDisconnect(client: Socket) {
      const username = this.usersService.remove(client.id);
      if (username) {
        this.server.emit('users:update', this.usersService.findAll());
        this.server.emit('notification', `${username} se ha desconectado`);
      }
    }
  
    @SubscribeMessage('join')
    handleJoin(
      @MessageBody() data: { username: string },
      client: Socket,
    ): void {
      this.usersService.create({
        name: data.username,
      });
      this.server.emit('users:update', this.usersService.findAll());
      this.server.emit('notification', `${data.username} se ha unido al tablero`);
    }
  
    // Evento personalizado: emitir una tarjeta creada
    emitCardCreated(card: any) {
      this.server.emit('card:created', card);
    }
  
    // Evento personalizado: emitir una tarjeta movida
    emitCardMoved(data: { cardId: string; toColumnId: string }) {
      this.server.emit('card:moved', data);
    }

    // Evento personalizado: emitir una columna creada
    emitColumnCreated(column: any) {
      this.server.emit('column:created', column);
    }
  
    // Evento genérico de notificación
    notifyAll(message: string) {
      this.server.emit('notification', message);
    }
  }
  