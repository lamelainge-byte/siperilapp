import type { AuthUseCases } from '../modules/auth/application/AuthUseCases.js';
import { GetCurrentUser } from '../modules/auth/application/use-cases/GetCurrentUser.js';
import { AccessLogAdapter } from '../modules/auth/infrastructure/adapters/AccessLogAdapter.js';
import { ListAccessLogs } from '../modules/auth/application/use-cases/ListAccessLogs.js';
import { LoginUser } from '../modules/auth/application/use-cases/LoginUser.js';
import { LogoutUser } from '../modules/auth/application/use-cases/LogoutUser.js';
import { RefreshSession } from '../modules/auth/application/use-cases/RefreshSession.js';
import { RegisterUser } from '../modules/auth/application/use-cases/RegisterUser.js';
import { JwtTokenAdapter } from '../modules/auth/infrastructure/adapters/JwtTokenAdapter.js';
import { RefreshTokenAdapter } from '../modules/auth/infrastructure/adapters/RefreshTokenAdapter.js';
import type { ReportUseCases } from '../modules/reports/application/ReportUseCases.js';
import { CreateReport } from '../modules/reports/application/use-cases/CreateReport.js';
import { DeleteReport } from '../modules/reports/application/use-cases/DeleteReport.js';
import { GetReport } from '../modules/reports/application/use-cases/GetReport.js';
import { GetReportStats } from '../modules/reports/application/use-cases/GetReportStats.js';
import { ListReports } from '../modules/reports/application/use-cases/ListReports.js';
import { ResolveReport } from '../modules/reports/application/use-cases/ResolveReport.js';
import { UpdateReport } from '../modules/reports/application/use-cases/UpdateReport.js';
import { EmailJsNotifier } from '../modules/reports/infrastructure/adapters/EmailJsNotifier.js';
import { OpenWeatherAdapter } from '../modules/reports/infrastructure/adapters/OpenWeatherAdapter.js';
import { ReportAdapter } from '../modules/reports/infrastructure/adapters/ReportAdapter.js';
import type { SiteUseCases } from '../modules/sites/application/SiteUseCases.js';
import { CreateSite } from '../modules/sites/application/use-cases/CreateSite.js';
import { DeleteSite } from '../modules/sites/application/use-cases/DeleteSite.js';
import { GetSite } from '../modules/sites/application/use-cases/GetSite.js';
import { ListSites } from '../modules/sites/application/use-cases/ListSites.js';
import { UpdateSite } from '../modules/sites/application/use-cases/UpdateSite.js';
import { SiteAdapter } from '../modules/sites/infrastructure/adapters/SiteAdapter.js';
import type { UserUseCases } from '../modules/users/application/UserUseCases.js';
import { CreateUser } from '../modules/users/application/use-cases/CreateUser.js';
import { DeleteUser } from '../modules/users/application/use-cases/DeleteUser.js';
import { GetUser } from '../modules/users/application/use-cases/GetUser.js';
import { GetUsers } from '../modules/users/application/use-cases/GetUsers.js';
import { UpdateUser } from '../modules/users/application/use-cases/UpdateUser.js';
import { BcryptHasher } from '../modules/users/infrastructure/adapters/BcryptHasher.js';
import { UserAdapter } from '../modules/users/infrastructure/adapters/UserAdapter.js';
import { envs } from '../shared/config/environment-vars.js';

export type AppContainer = {
  userUseCases: UserUseCases;
  authUseCases: AuthUseCases;
  reportUseCases: ReportUseCases;
  siteUseCases: SiteUseCases;
};

// se llama despues de abrir la base, aqui se enchufan los adaptadores a los casos de uso
export function buildContainer(): AppContainer {
  const users = new UserAdapter(); // habla con la tabla user usando appdatasource
  const reports = new ReportAdapter(); // habla con la tabla report
  const sites = new SiteAdapter(); // habla con la tabla site
  const refreshTokens = new RefreshTokenAdapter(); // habla con refreshtoken
  const accessLogs = new AccessLogAdapter();
  const hasher = new BcryptHasher(); // hashea y compara claves; no toca la base
  const tokens = new JwtTokenAdapter({
    accessSecret: envs.jwtAccessSecret, // firma del access token
    accessExpires: envs.jwtAccessExpires,
    refreshExpiresDays: envs.jwtRefreshExpiresDays,
    tokens: refreshTokens,
    users,
  });
  const weather = new OpenWeatherAdapter(envs.openWeatherApiKey);
  const notifier = new EmailJsNotifier(envs.emailJs); // correo opcional al crear un reporte
  const publicBaseUrl = envs.publicBaseUrl;

  return {
    userUseCases: {
      createUser: new CreateUser(users, hasher),
      getUser: new GetUser(users),
      getUsers: new GetUsers(users),
      updateUser: new UpdateUser(users, hasher),
      deleteUser: new DeleteUser(users),
    },
    authUseCases: {
      registerUser: new RegisterUser(users, hasher, accessLogs),
      loginUser: new LoginUser(users, hasher, tokens, accessLogs),
      refreshSession: new RefreshSession(tokens),
      logoutUser: new LogoutUser(tokens),
      getCurrentUser: new GetCurrentUser(users),
      listAccessLogs: new ListAccessLogs(accessLogs),
    },
    reportUseCases: {
      listReports: new ListReports(reports, publicBaseUrl),
      getReport: new GetReport(reports, publicBaseUrl),
      createReport: new CreateReport(reports, users, sites, weather, notifier, publicBaseUrl),
      updateReport: new UpdateReport(reports, sites, weather, publicBaseUrl),
      deleteReport: new DeleteReport(reports),
      resolveReport: new ResolveReport(reports, publicBaseUrl),
      getReportStats: new GetReportStats(reports),
    },
    siteUseCases: {
      listSites: new ListSites(sites, users),
      getSite: new GetSite(sites, users),
      createSite: new CreateSite(sites),
      updateSite: new UpdateSite(sites),
      deleteSite: new DeleteSite(sites),
    },
  };
}
