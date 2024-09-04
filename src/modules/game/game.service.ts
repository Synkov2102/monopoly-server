import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Game, GameSchema } from '../service/schemas/game.chema';
import { Field } from '../service/schemas/field.chema';
import payToPlayer from 'src/utils/payToPlayer-util';
import payToGame from 'src/utils/payToGame-util';

type TDices = [number, number];

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<Game>,
    @InjectModel(Field.name) private fieldModel: Model<Field>,
  ) {}

  // Генерация значений кубиков
  getDices(): TDices {
    const getRandomInt = (max: number): number => {
      return Math.floor(Math.random() * max) + 1;
    };
    return [getRandomInt(6), getRandomInt(6)];
  }

  // Расчет позиции игрока
  getNewPosition(oldPosition: number, dices: TDices) {
    let newPosition = oldPosition + dices[0] + dices[1];
    if (newPosition > 39) {
      newPosition = newPosition - 39;
    }
    return newPosition;
  }

  // Расчет того кто ходит следующим
  goToNextMove(gameData: GameSchema) {
    const newGameData = JSON.parse(JSON.stringify(gameData));
    const currentMoveIndex = newGameData.players.findIndex(
      (player) => player._id === newGameData.currentMove,
    );
    let nextMovePlayerIndex = currentMoveIndex + 1;
    if (nextMovePlayerIndex === newGameData.players.length) {
      nextMovePlayerIndex = 0;
    }
    return newGameData.players[nextMovePlayerIndex]._id;
  }

  // Действие игрока - бросок кубиков
  async rollDices(
    userId: mongoose.Types.ObjectId,
    gameId: mongoose.Types.ObjectId,
  ) {
    const gameData = await this.gameModel.findOne({ _id: gameId });
    // Ищем пользователя кидаем кубики и считаем позицию
    const userPosition = gameData.players.find(
      (player) => player._id.toString() === userId.toString(),
    ).currentPosition;
    const dices = this.getDices();
    const newPosition = this.getNewPosition(userPosition, dices);

    // Применяем изменения к конкретному пользователю
    const editedIndex = gameData.players.findIndex(
      (player) => player._id.toString() === userId.toString(),
    );
    gameData.players[editedIndex].currentPosition = newPosition;
    const players = gameData.players;
    const action = await this.checkNewPosition(userId, gameId, newPosition);

    if (action === 'nextPlayerRoll') {
      return this.gameModel.findOneAndUpdate(
        { _id: gameId },
        {
          $set: {
            players: gameData.players,
            action: 'rollDices',
            currentMove: this.goToNextMove(gameData),
          },
        },
        { new: true },
      );
    }

    return this.gameModel.findOneAndUpdate(
      { _id: gameId },
      { $set: { players, action } },
      { new: true },
    );
  }

  async checkNewPosition(
    userId: mongoose.Types.ObjectId,
    gameId: mongoose.Types.ObjectId,
    position: number,
  ) {
    const gameData = await this.gameModel.findOne({ _id: gameId });
    const fieldSituation = gameData.fields.find(
      (field) => field.position === position,
    );
    console.log(fieldSituation);
    if (fieldSituation?.ownerId === null) {
      return 'buyField';
    }

    if (
      fieldSituation?.ownerId &&
      fieldSituation?.ownerId !== null &&
      fieldSituation?.ownerId !== userId
    ) {
      return 'payRent';
    }

    return 'nextPlayerRoll'; // Временное решение что-бы не стопить ходы
  }

  async payRent(
    userId: mongoose.Types.ObjectId,
    gameId: mongoose.Types.ObjectId,
    position: number,
  ) {
    const fieldRules = await this.fieldModel.findOne({ position });
    const gameData = await this.gameModel.findOne({ _id: gameId });
    const fieldSituation = gameData.fields.find(
      (field) => field.position === position,
    );

    if (!fieldSituation.ownerId) {
      throw new BadGatewayException('У поля нет владельца');
    }

    let rent = fieldRules.rent;
    if (fieldSituation.level === 0 && fieldSituation.monopolied) {
      rent = fieldRules.monopolyRent;
    }
    if (fieldSituation.level > 0 && fieldSituation.monopolied) {
      rent = fieldRules.upgradeRent[fieldSituation.level - 1];
    }
    payToPlayer(gameData.players, userId, fieldSituation.ownerId, rent);

    return this.gameModel.findOneAndUpdate(
      { _id: gameId },
      {
        $set: {
          players: gameData.players,
          action: 'rollDices',
          currentMove: this.goToNextMove(gameData),
        },
      },
      { new: true },
    );
  }

  async buyField(
    userId: mongoose.Types.ObjectId,
    gameId: mongoose.Types.ObjectId,
    position: number,
  ) {
    const fieldRules = await this.fieldModel.findOne({ position });
    const gameData = await this.gameModel.findOne({ _id: gameId });
    const currentField = gameData.fields.find(
      (field) => field.position === position,
    );

    if (currentField.ownerId) {
      throw new BadGatewayException('У поля уже есть владелец');
    }

    payToGame(gameData.players, userId, fieldRules.printedPrice);

    const monopolyFields = [];

    gameData.fields.forEach((field, index) => {
      if (field.monopolyId === currentField.monopolyId) {
        monopolyFields.push(gameData.fields[index]);
      }
    });

    currentField.ownerId = userId;

    if (
      monopolyFields.every(
        (field) => field.ownerId?.toString() === userId?.toString(),
      )
    ) {
      monopolyFields.forEach((field) => {
        field.monopolied = true;
      });
    }

    return this.gameModel.findOneAndUpdate(
      { _id: gameId },
      {
        $set: {
          players: gameData.players,
          fields: gameData.fields,
          currentMove: this.goToNextMove(gameData),
          action: 'rollDices',
        },
      },
      { new: true },
    );
  }

  async skipMove(
    userId: mongoose.Types.ObjectId,
    gameId: mongoose.Types.ObjectId,
  ) {
    const gameData = await this.gameModel.findOne({ _id: gameId });

    if (gameData.currentMove.toString() !== userId.toString()) {
      throw new BadGatewayException('Ход другого игрока');
    }

    if (gameData.action !== 'buyField') {
      throw new BadGatewayException('Это действие нельзя пропустить');
    }

    return this.gameModel.findOneAndUpdate(
      { _id: gameId },
      {
        $set: {
          currentMove: this.goToNextMove(gameData),
          action: 'rollDices',
        },
      },
      { new: true },
    );
  }

  async getGameData(
    userId: mongoose.Types.ObjectId,
    gameId: mongoose.Types.ObjectId,
  ) {
    const gameData = await this.gameModel.findOne({
      _id: gameId,
      players: {
        $elemMatch: {
          _id: userId,
        },
      },
    });

    return gameData;
  }

  async getFieldsData(gameId: mongoose.Types.ObjectId) {
    return this.fieldModel.find({});
  }
}
