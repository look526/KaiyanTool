import { z } from 'zod';

const CharacterRefSchema = z.object({
  characterId: z.string(),
  imageId: z.string(),
  type: z.enum(['base', 'outfit', 'expression', 'angle']),
  prompt: z.string()
});

export async function createCharacterRef(input: z.infer<typeof CharacterRefSchema>) {
  CharacterRefSchema.parse(input);
  throw new Error('characterReference model not implemented');
}

export async function getCharacterRefs(_characterId: string) {
  throw new Error('characterReference model not implemented');
}

export async function deleteCharacterRef(_refId: string) {
  throw new Error('characterReference model not implemented');
}

export async function generateCharacterLook(
  _characterId: string,
  options: {
    type: 'base' | 'outfit' | 'expression' | 'angle';
    prompt?: string;
  }
) {
  return {
    type: options.type,
    prompt: options.prompt,
    baseReferences: []
  };
}

export async function getOutfitList(_characterId: string) {
  throw new Error('characterReference model not implemented');
}

export async function createOutfit(
  _characterId: string,
  _imageId: string,
  _prompt: string,
  _name: string
) {
  throw new Error('characterReference model not implemented');
}
