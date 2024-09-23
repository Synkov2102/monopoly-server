import mongoose from 'mongoose';
import { FieldDocument } from 'src/modules/service/schemas/field.chema';
import { GameDocument } from 'src/modules/service/schemas/game.chema';
import { IField } from 'src/types/types';
import calculateRent from './calculate-rent.util';

// Генерация значений кубиков
export default function checkFieldsCount(
  fieldRules: FieldDocument,
  gameData: GameDocument,
  currentField: IField,
  userId: mongoose.Types.ObjectId,
) {
  const sameFields = [];

  if (fieldRules.type === 'company') {
    gameData.fields.forEach((field, index) => {
      if (field.monopolyId === currentField.monopolyId) {
        sameFields.push(gameData.fields[index]);
      }
    });

    if (
      sameFields.every(
        (field) => field.ownerId?.toString() === userId?.toString(),
      )
    ) {
      sameFields.forEach((field) => {
        field.monopolied = true;
        field.renderedValue = `${calculateRent(field, fieldRules)} $`;
      });
    }
  }

  if (fieldRules.type === 'railroad') {
    gameData.fields.forEach((field, index) => {
      if (
        [5, 15, 25, 35].includes(field.position) &&
        field.ownerId?.toString() === userId?.toString()
      ) {
        sameFields.push(gameData.fields[index]);
      }
    });

    sameFields.forEach((field) => {
      field.level = sameFields.length;
      field.renderedValue = `${calculateRent(field, fieldRules)} $`;
    });
  }
}
