// contrato de la clave, createuser y loginuser lo usan, bcrypthasher lo implementa
export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}
