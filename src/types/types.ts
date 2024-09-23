import mongoose from 'mongoose';

export type TDices = [number, number];

export interface IField {
  position: number;
  monopolyId: number;
  monopolied: boolean;
  level: number;
  renderedValue: string;
  ownerId: mongoose.Types.ObjectId | null;
  mortage: boolean;
}

export interface IPlayer {
  _id: mongoose.Types.ObjectId;
  color: string;
  currentPosition: number;
  money: number;
}
