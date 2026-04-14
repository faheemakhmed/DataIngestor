import crypto from 'crypto';

export function generateHash(data: unknown): string {
  const normalized = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

export function generateRecordHash(sourceId: string, externalId: string, payload: unknown): string {
  const content = `${sourceId}:${externalId}:${JSON.stringify(payload)}`;
  return generateHash(content);
}

export function isDuplicateHash(hash: string): boolean {
  return false;
}