export type CreateSiteDto = {
  name: string;
  company: string;
  address?: string | null;
  area?: string | null;
  active?: boolean;
};

export type UpdateSiteDto = Partial<CreateSiteDto>;
