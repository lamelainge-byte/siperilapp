// joi del body de sitios, crea y actualiza
// direccion o area vacias se guardan como null
// active puede llegar como boolean o como el texto true o false
import Joi from 'joi';
import { throwIfInvalid } from '../../../../shared/utils/joi.js';
import type { CreateSiteDto, UpdateSiteDto } from '../../application/dto/SiteDto.js';

const optionalText = Joi.string().allow('', null).optional();

function normalize(value: Record<string, unknown>) {
  const out = { ...value };
  for (const key of ['address', 'area']) {
    if (out[key] === '') out[key] = null;
  }
  if (out.active === 'true') out.active = true;
  if (out.active === 'false') out.active = false;
  return out;
}

const createSchema = Joi.object({
  name: Joi.string().trim().min(2).required().messages({
    'string.min': 'El nombre del sitio es obligatorio',
  }),
  company: Joi.string().trim().min(2).required().messages({
    'string.min': 'La empresa es obligatoria',
  }),
  address: optionalText,
  area: optionalText,
  active: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')).optional(),
}).unknown(false);

export function loadCreateSiteData(data: unknown): CreateSiteDto {
  const { error, value } = createSchema.validate(data, { abortEarly: false });
  throwIfInvalid(error);
  return normalize(value) as CreateSiteDto;
}

export function loadUpdateSiteData(data: unknown): UpdateSiteDto {
  const { error, value } = createSchema
    .fork(['name', 'company'], (schema) => schema.optional())
    .min(1)
    .validate(data, { abortEarly: false });
  throwIfInvalid(error);
  return normalize(value) as UpdateSiteDto;
}
