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
  posted_by: number | null;
}
