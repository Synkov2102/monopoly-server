import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Game } from '../service/schemas/game.chema';
import { Field } from '../service/schemas/field.chema';
import payToPlayer from 'src/utils/pay-to-player.util';
import payToGame from 'src/utils/pay-to-game.util';
import { ActionsService } from './actions.service';
import getDices from 'src/utils/get-dices.util';
import getNewPosition from 'src/utils/get-new-position.util';
import goToNextMove from 'src/utils/go-to-next-move.util';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<Game>,
    @InjectModel(Field.name) private fieldModel: Model<Field>,
    private readonly actionsService: ActionsService,
  ) {}

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
    const dices = getDices();
    const newPosition = getNewPosition(userPosition, dices);

    // Применяем изменения к конкретному пользователю
    const editedIndex = gameData.players.findIndex(
      (player) => player._id.toString() === userId.toString(),
    );
    gameData.players[editedIndex].currentPosition = newPosition;
    const players = gameData.players;
    const action = await this.actionsService.checkNewPosition(
      userId,
      gameId,
      newPosition,
    );

    if (action === 'nextPlayerRoll') {
      return this.gameModel.findOneAndUpdate(
        { _id: gameId },
        {
          $set: {
            players: gameData.players,
            action: 'rollDices',
            currentMove: goToNextMove(gameData),
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
          currentMove: goToNextMove(gameData),
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
          currentMove: goToNextMove(gameData),
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
          currentMove: goToNextMove(gameData),
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
    console.log(gameId);
    return this.fieldModel.find({});
  }
}
