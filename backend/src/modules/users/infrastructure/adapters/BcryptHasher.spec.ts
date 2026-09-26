import { describe, expect, it } from 'vitest';
import bcrypt from 'bcrypt';

describe('seguridad de contraseñas', () => {
  it('hashea y verifica con bcrypt (nunca texto plano)', async () => {
    const plain = 'secreto123';
    const hash = await bcrypt.hash(plain, 10);
    expect(hash).not.toBe(plain);
    expect(await bcrypt.compare(plain, hash)).toBe(true);
    expect(await bcrypt.compare('otra', hash)).toBe(false);
  });
});
