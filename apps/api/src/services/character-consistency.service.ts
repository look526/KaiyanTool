import { prisma } from '../lib/prisma';

const CharacterRefSchema = z.object({
  characterId: z.string(),
  imageId: z.string(),
  type: z.enum(['base', 'outfit', 'expression', 'angle']),
  prompt: z.string()
});

export async function createCharacterRef(input: z.infer<typeof CharacterRefSchema>) {
  const validated = CharacterRefSchema.parse(input);

  return prisma.characterReference.create({
    data: {
      characterId: validated.characterId,
      imageId: validated.imageId,
      type: validated.type,
      prompt: validated.prompt
    }
  });
}

export async function getCharacterRefs(characterId: string) {
  return prisma.characterReference.findMany({
    where: { characterId },
    include: { image: true }
  });
}

export async function deleteCharacterRef(refId: string) {
  return prisma.characterReference.delete({
    where: { id: refId }
  });
}

export async function generateCharacterLook(
  characterId: string,
  options: {
    type: 'base' | 'outfit' | 'expression' | 'angle';
    prompt?: string;
  }
) {
  const character = await prisma.character.findUnique({
    where: { id: characterId }
  });

  if (!character) {
    throw new Error('Character not found');
  }

  const baseRefs = await prisma.characterReference.findMany({
    where: { characterId, type: 'base' }
  });

  const basePrompt = baseRefs.length > 0
    ? baseRefs[0].prompt
    : `A character with ${character.description}`;

  const enhancedPrompt = options.prompt
    ? `${basePrompt}, ${options.prompt}`
    : basePrompt;

  return {
    characterId,
    type: options.type,
    prompt: enhancedPrompt,
    baseReferences: baseRefs.map(r => r.imageId)
  };
}

export async function getOutfitList(characterId: string) {
  return prisma.characterReference.findMany({
    where: {
      characterId,
      type: 'outfit'
    },
    include: { image: true }
  });
}

export async function createOutfit(
  characterId: string,
  imageId: string,
  prompt: string,
  name: string
) {
  return prisma.characterReference.create({
    data: {
      characterId,
      imageId,
      type: 'outfit',
      prompt,
      metadata: { name }
    }
  });
}
