import type { Actor } from './types.js';

export type AuthPayload = {
  sub: string;
  role: Actor['role'];
  email: string;
};

// pasa el payload del jwt al usuario que usan los casos de uso
export function toActor(user: AuthPayload): Actor {
  return { id: user.sub, role: user.role, email: user.email };
}
