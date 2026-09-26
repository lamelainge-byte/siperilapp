import bcrypt from 'bcrypt';
import type { PasswordHasher } from '../../domain/ports/HasherPort.js';

// la contraseña se guarda hasheada y nunca en texto plano
export class BcryptHasher implements PasswordHasher {
  constructor(private readonly rounds = 12) {} // 12 vueltas de bcrypt encarecen un ataque de fuerza bruta

  hash(plain: string) {
    return bcrypt.hash(plain, this.rounds);
  }

  compare(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }
}
