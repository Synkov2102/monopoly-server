import { BadGatewayException, NotFoundException } from '@nestjs/common';
import mongoose from 'mongoose';
import { IPlayer } from 'src/modules/service/schemas/game.chema';

export default function payToGame(
  players: IPlayer[],
  fromPlayerId: mongoose.Types.ObjectId,
  amount: number,
) {
  const fromPlayer = players.find(
    (player) => player._id.toString() === fromPlayerId.toString(),
  );

  // Проверить, существуют ли оба игрока и достаточно ли денег у отправителя
  if (!fromPlayer) {
    throw new NotFoundException('Игрок не найден.');
  }

  if (fromPlayer.money < amount) {
    throw new BadGatewayException('Недостаточно средств');
  }

  // Выполнить перевод
  fromPlayer.money -= amount;
}
