export enum Role {
  Seller = 'Seller',
  Buyer = 'Buyer',
}

export enum CoinValue {
  FIVE = 5,
  TEN = 10,
  TWENTY = 20,
  FIFTY = 50,
  ONE_HUNDRED = 100,
}

export type UserPayload = {
  id: string;
  role: Role;
  email: string;
};
