import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway {
  @WebSocketServer() server: Server;
  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage('rollDices')
  async handleRollDices(
    @MessageBody() data: { userId: string; gameId: string },
  ) {
    const userObjectId = new mongoose.Types.ObjectId(data.userId);
    const gameObjectId = new mongoose.Types.ObjectId(data.gameId);

    const gameData = await this.gameService.rollDices(
      userObjectId,
      gameObjectId,
    );

    this.server.to(data.gameId).emit('changeGameData', gameData);
  }

  @SubscribeMessage('getGameData')
  async handleGetGameData(
    @MessageBody() data: { userId: string; gameId: string },
  ) {
    const userObjectId = new mongoose.Types.ObjectId(data.userId);
    const gameObjectId = new mongoose.Types.ObjectId(data.gameId);

    return this.gameService.getGameData(userObjectId, gameObjectId);
  }

  @SubscribeMessage('getFieldsData')
  async handleGetFieldsData(@MessageBody() data: { gameId: string }) {
    const gameObjectId = new mongoose.Types.ObjectId(data.gameId);

    return this.gameService.getFieldsData(gameObjectId);
  }

  @SubscribeMessage('payRent')
  async handlePayRent(
    @MessageBody() data: { userId: string; gameId: string; position: number },
  ) {
    const userObjectId = new mongoose.Types.ObjectId(data.userId);
    const gameObjectId = new mongoose.Types.ObjectId(data.gameId);

    const res = await this.gameService.payRent(
      userObjectId,
      gameObjectId,
      data.position,
    );

    this.server.to(data.gameId).emit('changeGameData', res);
    return res;
  }

  @SubscribeMessage('buyField')
  async handleBuyField(
    @MessageBody() data: { userId: string; gameId: string; position: number },
  ) {
    const userObjectId = new mongoose.Types.ObjectId(data.userId);
    const gameObjectId = new mongoose.Types.ObjectId(data.gameId);

    const res = await this.gameService.buyField(
      userObjectId,
      gameObjectId,
      data.position,
    );

    this.server.to(data.gameId).emit('changeGameData', res);
    return res;
  }

  @SubscribeMessage('skipMove')
  async handleSkipMove(
    @MessageBody() data: { userId: string; gameId: string },
  ) {
    const userObjectId = new mongoose.Types.ObjectId(data.userId);
    const gameObjectId = new mongoose.Types.ObjectId(data.gameId);

    const res = await this.gameService.skipMove(userObjectId, gameObjectId);

    this.server.to(data.gameId).emit('changeGameData', res);
    return res;
  }
}
