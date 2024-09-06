import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Game } from './schemas/game.chema';
import { Field } from './schemas/field.chema';
import { playersColors } from 'src/constants/colors';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<Game>,
    @InjectModel(Field.name) private fieldModel: Model<Field>,
  ) {}

  // Получение игр
  getGames() {
    return this.gameModel.find({});
  }

  // Создать игру
  async createGame(userId: mongoose.Types.ObjectId) {
    const createdGame = new this.gameModel();
    createdGame.creator = userId;
    return createdGame.save();
  }

  // Добавление игрока в игру
  async joinGame(
    userId: mongoose.Types.ObjectId,
    gameId: mongoose.Types.ObjectId,
  ) {
    const game = await this.gameModel.findOne({ _id: gameId });
    if (game.players.length >= 4)
      throw new Error('В игре полный набор игроков.');
    if (
      game.players.filter((e) => e._id.toString() === userId.toString()).length
    )
      throw new Error(
        `Игрок: ${userId.toString()} уже присоединился к этой игре.`,
      );
    game.players.push({
      _id: userId,
      currentPosition: 0,
      money: 1500,
      color: '#ffffff',
    });
    return this.gameModel.findOneAndUpdate(
      { _id: gameId },
      { $set: { players: game.players } },
    );
  }

  // Добавление игрока в игру
  async deleteGame(
    userId: mongoose.Types.ObjectId,
    gameId: mongoose.Types.ObjectId,
  ) {
    return this.gameModel.deleteOne({ _id: gameId, creator: userId });
  }

  // Запуск игры
  async startGame(gameId: mongoose.Types.ObjectId) {
    const game = await this.gameModel.findById(gameId);
    const fields = await this.fieldModel.find();

    if (!game) {
      throw new Error('Игра для старта не найдена');
    }
    if (!game.players.length) {
      throw new Error('В игре отсутствуют игроки');
    }

    game.status = 'inProgress';
    game.action = 'rollDices';
    game.fields = fields.map((field) => ({
      position: field.position,
      monopolyId: field.monopolyId,
      level: 0,
      ownerId: null,
      monopolied: false,
      mortage: false,
    }));
    game.players = game.players.map((player, i) => ({
      ...player,
      color: playersColors[i],
    }));
    game.currentMove = game.players[0]._id;

    await game.save();
  }
}
