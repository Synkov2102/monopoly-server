import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import mongoose from 'mongoose';
import { Server, Socket } from 'socket.io';
import { ServiceService } from './service.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ServiceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  constructor(private readonly serviceService: ServiceService) {
    this.startSendingGames();
  }

  async startSendingGames() {
    setInterval(async () => {
      const games = await this.serviceService.getGames();
      this.server.emit('games', games);
    }, 3000); // 3 секунды
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeGame')
  async subscribeGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    const rooms = Object.keys(client.rooms);
    const isInRoom = rooms.includes(data.gameId);
    if (!isInRoom) client.join(data.gameId);
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; gameId: string },
  ) {
    const userObjectId = new mongoose.Types.ObjectId(data.userId);
    const gameObjectId = new mongoose.Types.ObjectId(data.gameId);

    const game = await this.serviceService.joinGame(userObjectId, gameObjectId);

    client.join(game._id.toString());
    client.emit('joinedGame', game._id.toString());
  }

  @SubscribeMessage('startGame')
  async handleStartGame(@MessageBody() data: { gameId: string }) {
    const gameObjectId = new mongoose.Types.ObjectId(data.gameId);

    await this.serviceService.startGame(gameObjectId);

    this.server.to(data.gameId).emit('startGame', data.gameId);
  }

  @SubscribeMessage('createGame')
  handleCreateGame() {
    console.log('createGame');
    return this.serviceService.createGame();
  }
}
