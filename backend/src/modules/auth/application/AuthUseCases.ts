import type { GetCurrentUser } from './use-cases/GetCurrentUser.js';
import type { LoginUser } from './use-cases/LoginUser.js';
import type { LogoutUser } from './use-cases/LogoutUser.js';
import type { RefreshSession } from './use-cases/RefreshSession.js';
import type { RegisterUser } from './use-cases/RegisterUser.js';

export type AuthUseCases = {
  registerUser: RegisterUser;
  loginUser: LoginUser;
  refreshSession: RefreshSession;
  logoutUser: LogoutUser;
  getCurrentUser: GetCurrentUser;
};
