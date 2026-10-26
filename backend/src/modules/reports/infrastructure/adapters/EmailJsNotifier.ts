import type { NewReportNotice, NotifierPort } from '../../domain/ports/NotifierPort.js';

const REPORT_LABELS: Record<string, string> = {
  unsafe_condition: 'Actos y condiciones inseguras',
  work_accident: 'Accidente de trabajo',
  maintenance: 'Registro de mantenimiento',
  road_accident: 'Accidente vial',
  height_equipment: 'Daño de equipos de trabajo en alturas',
};

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
    const reportType = REPORT_LABELS[params.reportType] ?? params.reportType;
    const message = [
      'Se creó un nuevo reporte en SIPERIL.',
      `Tipo: ${reportType}`,
      `Trabajador: ${params.userName}`,
      `Empresa: ${params.company}`,
      `Lugar: ${params.place || 'Sin lugar'}`,
      `Descripción: ${params.description}`,
      `Fecha: ${params.date}`,
    ].join('\n');
    try {
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
            report_type: reportType,
            place: params.place || 'Sin lugar',
            date: params.date,
            message,
          },
        }),
      });
      if (!response.ok) {
        console.warn('EmailJS no pudo enviar el aviso del reporte.');
      }
      return response.ok;
    } catch {
      console.warn('EmailJS no pudo enviar el aviso del reporte.');
      return false;
    }
  }
}
