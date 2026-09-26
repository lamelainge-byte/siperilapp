import Joi from 'joi';
import { throwIfInvalid } from '../../../../shared/utils/joi.js';
import type { CreateReportDto, UpdateReportDto } from '../../application/dto/ReportDto.js';

const reportTypes = [
  // los cuatro tipos que ofrece el menu de inicio
  'unsafe_condition',
  'work_accident',
  'maintenance',
  'road_accident',
] as const;

const optionalText = Joi.string().allow('', null).optional();
const optionalNumber = Joi.alternatives()
  .try(Joi.number(), Joi.string().allow(''))
  .optional()
  .allow(null);

// el formulario manda textos vacios y aqui se vuelven null o numero
function normalize(value: Record<string, unknown>) {
  const out = { ...value };
  for (const key of ['incidentDate', 'incidentTime', 'shift', 'place', 'siteId']) {
    if (out[key] === '') out[key] = null;
  }
  for (const key of ['latitude', 'longitude']) {
    if (out[key] === '' || Number.isNaN(out[key])) out[key] = null;
    else if (typeof out[key] === 'string') out[key] = Number(out[key]);
  }
  return out;
}

const createSchema = Joi.object({
  reportType: Joi.string().valid(...reportTypes).required(),
  description: Joi.string().min(5).required().messages({
    'string.min': 'Describe el incidente (mínimo 5 caracteres)',
  }),
  incidentDate: optionalText,
  incidentTime: optionalText,
  shift: optionalText,
  place: optionalText,
  siteId: optionalText,
  latitude: optionalNumber,
  longitude: optionalNumber,
}).unknown(true);

export function loadCreateReportData(data: unknown): CreateReportDto {
  const { error, value } = createSchema.validate(data, { abortEarly: false });
  throwIfInvalid(error);
  return normalize(value) as CreateReportDto;
}

export function loadUpdateReportData(data: unknown): UpdateReportDto {
  const { error, value } = createSchema
    .fork(['reportType', 'description'], (schema) => schema.optional())
    .validate(data, { abortEarly: false });
  throwIfInvalid(error);
  return normalize(value) as UpdateReportDto;
}
