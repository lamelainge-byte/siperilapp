// body de registro, login y refresh, no incluye el hash: la clave llega en claro y se hashea en el caso de uso
export type RegisterDto = {
  name: string;
  email: string;
  company: string;
  employeeNumber: string;
  password: string;
};

export type LoginDto = {
  email: string;
  password: string;
};
