import PAYMENT_METHODS from './constants';

export type TPaymentMethods = typeof PAYMENT_METHODS[number];

export type TOrder = {
  payment: TPaymentMethods;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
};
