import slugify from 'slugify';
import prisma from '../lib/prisma';

export function createSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export async function createUniqueSlug(
  text: string,
  existingId?: string
): Promise<string> {
  let slug = createSlug(text);
  let counter = 0;
  let finalSlug = slug;

  while (true) {
    const existing = await prisma.store.findUnique({
      where: { slug: finalSlug },
    });

    // Si no existe o es el mismo registro que estamos editando
    if (!existing || existing.id === existingId) {
      return finalSlug;
    }

    counter++;
    finalSlug = `${slug}-${counter}`;
  }
}
