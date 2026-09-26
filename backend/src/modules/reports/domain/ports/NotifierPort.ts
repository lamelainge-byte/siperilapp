export type NewReportNotice = {
  userName: string;
  company: string;
  description: string;
  reportType: string;
  date: string;
};

export interface NotifierPort {
  notifyNewReport(params: NewReportNotice): Promise<boolean>;
}
