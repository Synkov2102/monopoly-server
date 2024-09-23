import { BadGatewayException, NotFoundException } from '@nestjs/common';
import mongoose from 'mongoose';
import { IPlayer } from 'src/types/types';

export default function payToPlayer(
  players: IPlayer[],
  fromPlayerId: mongoose.Types.ObjectId,
  toPlayerId: mongoose.Types.ObjectId,
  amount: number,
) {
  const fromPlayer = players.find(
    (player) => player._id.toString() === fromPlayerId.toString(),
  );
  const toPlayer = players.find(
    (player) => player._id.toString() === toPlayerId.toString(),
  );

  // Проверить, существуют ли оба игрока и достаточно ли денег у отправителя
  if (!fromPlayer || !toPlayer) {
    throw new NotFoundException('Один из игроков не найден.');
  }

  if (fromPlayer.money < amount) {
    throw new BadGatewayException('Недостаточно средств');
  }

  // Выполнить перевод
  fromPlayer.money -= amount;
  toPlayer.money += amount;
}
