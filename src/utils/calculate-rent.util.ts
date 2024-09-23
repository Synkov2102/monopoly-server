import { FieldDocument } from 'src/modules/service/schemas/field.chema';
import { IField } from 'src/types/types';

export default function calculateRent(
  fieldSituation: IField,
  fieldRules: FieldDocument,
) {
  if (fieldRules.type === 'company') {
    let rent = fieldRules.rent;
    if (fieldSituation.level === 0 && fieldSituation.monopolied) {
      rent = fieldRules.monopolyRent;
    }
    if (fieldSituation.level > 0 && fieldSituation.monopolied) {
      rent = fieldRules.upgradeRent[fieldSituation.level - 1];
    }
    return rent;
  }

  if (fieldRules.type === 'railroad') {
    return Math.pow(2, fieldSituation.level - 1) * fieldRules.rent;
  }
}
