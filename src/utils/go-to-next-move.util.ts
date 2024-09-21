import { GameDocument } from 'src/modules/service/schemas/game.chema';

// Расчет того кто ходит следующим
export default function goToNextMove(gameData: GameDocument) {
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
