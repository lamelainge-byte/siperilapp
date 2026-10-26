export type AccessKind = 'register' | 'login';

export type AccessLog = {
  id: string;
  userId: string;
  name: string;
  email: string;
  company: string;
  employeeNumber: string | null;
  kind: AccessKind;
  createdAt: Date;
};

// un trabajador aparece una sola vez, con la alta y la primera entrada
export type WorkerIngress = {
  id: string;
  userId: string;
  name: string;
  email: string;
  company: string;
  employeeNumber: string | null;
  registeredAt: Date | null;
  loggedInAt: Date | null;
};
