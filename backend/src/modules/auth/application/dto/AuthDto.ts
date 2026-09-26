export type RegisterDto = {
  name: string;
  email: string;
  company: string;
  password: string;
};

export type LoginDto = {
  email: string;
  password: string;
};
