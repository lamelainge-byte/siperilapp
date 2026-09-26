import { Pipe, PipeTransform } from '@angular/core';
import { REPORT_LABELS, type ReportType } from '../../models/siperil.models';

@Pipe({ name: 'reportTypeLabel' })
export class ReportTypeLabelPipe implements PipeTransform {
  // traduce el codigo del tipo al texto que ve el usuario
  transform(value: ReportType): string {
    return REPORT_LABELS[value] ?? value;
  }
}
