//Declare interfaces here, import into proper locations

export interface RegistrationInfo {
  username: string;
  password: string;
  passwordConf: string;
  phone_num: string;
  street_num: string;
  city: string;
  state: string;
  zip_code: number | null;
  email: string;
}

export interface LoginInfo {
  username: string;
  password: string;
}

export interface ProductInfo {
  prodName: string;
  prodDesc: string;
  price: number | null;
  posted_by: string | null;
  quantity: number;
}

export interface ProductFinal {
  datetime_created: string;
  idProducts: number;
  is_active: boolean;
  is_exchanged: boolean;
  posted_by: string | null;
  price: number;
  prodDesc: string;
  prodName: string;
  quantity: number;
}

export interface TransactionInfo {
  idtransactions: number;
  item_exchanged_1: number;
  item_exchanged_2: number;
  party_1: string;
  party_2: string;
  date_started: string;
  date_ended: string;
  hash_key: string;
  via_1: string;
  via_2: string;
}
