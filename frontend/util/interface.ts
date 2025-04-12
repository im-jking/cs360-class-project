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
  posted_by: number | null;
  price: number;
  prodDesc: string;
  prodName: string;
  quantity: number;
}
