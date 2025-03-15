//Declare interfaces here, import into proper locations

export interface RegistrationInfo {
  username: string;
  password: string;
  passwordConf: string;
  phone: string;
  street_num: string;
  city: string;
  state: string;
  zip: number;
  email: string;
}

export interface LoginInfo {
  username: string;
  password: string;
}
