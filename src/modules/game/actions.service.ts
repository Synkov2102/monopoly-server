import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Game } from '../service/schemas/game.chema';
import { Field } from '../service/schemas/field.chema';
import goToNextMove from 'src/utils/go-to-next-move.util';

@Injectable()
export class ActionsService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<Game>,
    @InjectModel(Field.name) private fieldModel: Model<Field>,
  ) {}

  async checkNewPosition(
    userId: mongoose.Types.ObjectId,
    gameId: mongoose.Types.ObjectId,
    position: number,
  ) {
    const fieldRules = await this.fieldModel.findOne({ position });
    const gameData = await this.gameModel.findOne({ _id: gameId });
    const fieldSituation = gameData.fields.find(
      (field) => field.position === position,
    );

    if (fieldRules?.type && fieldRules.type === 'chance') {
      return 'chance';
    }

    if (
      fieldRules?.type &&
      (fieldRules.type === 'company' || fieldRules.type === 'railroad') &&
      fieldSituation?.ownerId === null
    ) {
      return 'buyField';
    }

    if (
      fieldSituation?.ownerId &&
      fieldSituation?.ownerId !== null &&
      fieldSituation?.ownerId.toString() !== userId.toString()
    ) {
      return 'payRent';
    }

    return 'nextPlayerRoll'; // Временное решение что-бы не стопить ходы
  }

  async movePlayerTo(
    number: number,
    userId: mongoose.Types.ObjectId,
    gameId: mongoose.Types.ObjectId,
    mode: 'const' | 'calculate' = 'const',
  ) {
    const gameData = await this.gameModel.findOne({ _id: gameId });
    const editedIndex = gameData.players.findIndex(
      (player) => player._id.toString() === userId.toString(),
    );
    if (mode === 'const') {
      gameData.players[editedIndex].currentPosition = number;
    } else {
      gameData.players[editedIndex].currentPosition =
        gameData.players[editedIndex].currentPosition + number;
    }

    const players = gameData.players;
    const action = await this.checkNewPosition(userId, gameId, number);

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
}
