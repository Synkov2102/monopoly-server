import { TDices } from 'src/types/types';

// Расчет позиции игрока
export default function getNewPosition(oldPosition: number, dices: TDices) {
  let newPosition = oldPosition + dices[0] + dices[1];
  if (newPosition > 39) {
    newPosition = newPosition - 39;
  }
  return newPosition;
}
