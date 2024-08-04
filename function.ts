import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export interface TemplateData {
  [key: string]: string;
}

export function getQueryParams(url: string): TemplateData {
  const paramArr = url.slice(url.indexOf('?') + 1).split('&');
  const params: TemplateData = {};
  for (const param of paramArr) {
    const [key, val] = param.split('=');
    params[key] = decodeURIComponent(val);
  }
  return params;
}

export async function renderTemplate(template: string): Promise<string> {
  try {
    const KVDB = await prisma.keyValue.findMany();
    return template.replace(/\{\{([^\}]+)\}\}/g, (match, key) => {
      if(key.startsWith('SECRET')) {
        return '***';
      }
      const KVMatch = KVDB.find(item => item.key === key);
      if (KVMatch) {
        return KVMatch.value || match;
      }
      return match;
    });
  } catch (error) {
    console.error('Error occurred while rendering template:', error);
    throw error;
  }
}
