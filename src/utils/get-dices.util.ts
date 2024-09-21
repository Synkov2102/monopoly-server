import { TDices } from 'src/types/types';

// Генерация значений кубиков
export default function getDices(): TDices {
  const getRandomInt = (max: number): number => {
    return Math.floor(Math.random() * max) + 1;
  };
  return [getRandomInt(6), getRandomInt(6)];
}
