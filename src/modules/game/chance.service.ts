import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Game, GameDocument } from '../service/schemas/game.chema';
import { Field } from '../service/schemas/field.chema';
import { ActionsService } from './actions.service';

@Injectable()
export class ChanceService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<Game>,
    @InjectModel(Field.name) private fieldModel: Model<Field>,
    private readonly actionsService: ActionsService,
  ) {}

  // Список функций
  private functionsList: Array<
    (
      userId: mongoose.Types.ObjectId,
      gameId: mongoose.Types.ObjectId,
    ) => Promise<GameDocument>
  > = [this.goBack3Spaces, this.goToIllinois, this.goToStart, this.goToJail];

  private async goBack3Spaces(
    userId: mongoose.Types.ObjectId,
    gameId: mongoose.Types.ObjectId,
  ) {
    console.log('На 3 назад');
    return this.actionsService.movePlayerTo(-3, userId, gameId, 'calculate');
  }

  private async goToIllinois(
    userId: mongoose.Types.ObjectId,
    gameId: mongoose.Types.ObjectId,
  ) {
    console.log('На Иллинойс');
    return this.actionsService.movePlayerTo(24, userId, gameId);
  }

  private async goToStart(
    userId: mongoose.Types.ObjectId,
    gameId: mongoose.Types.ObjectId,
  ) {
    console.log('На Старт');
    return this.actionsService.movePlayerTo(0, userId, gameId);
  }

  private async goToJail(
    userId: mongoose.Types.ObjectId,
    gameId: mongoose.Types.ObjectId,
  ) {
    console.log('В тюрьму');
    return this.actionsService.movePlayerTo(10, userId, gameId);
  }

  // Метод для случайного выбора функции
  public getChance(
    userId: mongoose.Types.ObjectId,
    gameId: mongoose.Types.ObjectId,
  ): void {
    const randomIndex = Math.floor(Math.random() * this.functionsList.length);
    const selectedFunction = this.functionsList[randomIndex];
    return selectedFunction.call(this, userId, gameId);
  }
}
