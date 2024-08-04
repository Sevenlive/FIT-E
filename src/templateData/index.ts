import { prisma } from '../../function';

export async function getAllTemplateData() {
    return await prisma.keyValue.findMany();
}
