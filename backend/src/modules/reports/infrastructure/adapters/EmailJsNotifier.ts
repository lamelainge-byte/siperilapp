import type { NewReportNotice, NotifierPort } from '../../domain/ports/NotifierPort.js';

export class EmailJsNotifier implements NotifierPort {
  constructor(
    private readonly config: {
      serviceId: string;
      templateId: string;
      publicKey: string;
      to: string;
    },
  ) {}

  async notifyNewReport(params: NewReportNotice): Promise<boolean> {
    const { serviceId, templateId, publicKey, to } = this.config;
    // el correo es opcional, sin claves solo deja un aviso en consola
    if (!serviceId || !templateId || !publicKey) {
      console.warn('EmailJS no configurado; se omite el correo de notificación.');
      return false;
    }
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // las claves salen del env y no viajan al celular
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          to_email: to,
          user_name: params.userName,
          company: params.company,
          description: params.description,
          report_type: params.reportType,
          date: params.date,
        },
      }),
    });
    return response.ok;
  }
}
