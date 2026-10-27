export type StoredImage = {
  mime: string;
  data: Buffer;
};

export interface ReportImagePort {
  save(filename: string, mime: string, data: Buffer): Promise<void>;
  find(filename: string): Promise<StoredImage | null>;
  remove(filename: string): Promise<void>;
}

// saca el nombre del archivo de una ruta o de una url publica
export function imageFilename(value: string | null | undefined): string | null {
  if (!value) return null;
  const tail = value.split('?')[0]?.split('/').pop() ?? '';
  if (!/^[a-zA-Z0-9._-]+$/.test(tail)) return null;
  return tail;
}
