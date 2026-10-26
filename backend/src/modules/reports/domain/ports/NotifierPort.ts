// contrato del aviso por correo, si emailjs no esta en el .env, el adaptador no envia nada
export type NewReportNotice = {
  userName: string;
  company: string;
  description: string;
  reportType: string;
  place: string | null;
  date: string;
};

export interface NotifierPort {
  notifyNewReport(params: NewReportNotice): Promise<boolean>;
}
