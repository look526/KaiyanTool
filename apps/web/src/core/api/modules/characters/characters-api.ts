import { httpClient } from '../../client/http-client';

export interface Character {
  id: string;
  name: string;
  description?: string;
  projectId?: string;
  referenceImages?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCharacterRequest {
  name: string;
  description?: string;
  referenceImages?: string[];
}

export interface UpdateCharacterRequest {
  name?: string;
  description?: string;
  referenceImages?: string[];
}

export interface ClothingVariant {
  id: string;
  characterId: string;
  name?: string;
  imageUrl?: string;
  category?: string;
  createdAt?: string;
}

export interface CreateClothingVariantRequest {
  characterId: string;
  name?: string;
  imageUrl?: string;
  category?: string;
}

export interface WardrobeItem {
  id: string;
  characterId: string;
  name?: string;
  imageUrl?: string;
  category?: string;
  createdAt?: string;
}

export interface CreateWardrobeItemRequest {
  name?: string;
  imageUrl?: string;
  category?: string;
}

export const charactersApi = {
  async getCharacters(projectId: string): Promise<Character[]> {
    return httpClient.get<Character[]>(`/projects/${projectId}/characters`);
  },

  async createCharacter(projectId: string, data: CreateCharacterRequest): Promise<Character> {
    return httpClient.post<Character>(`/projects/${projectId}/characters`, data);
  },

  async updateCharacter(id: string, data: UpdateCharacterRequest): Promise<Character> {
    return httpClient.put<Character>(`/characters/${id}`, data);
  },

  async deleteCharacter(id: string): Promise<void> {
    return httpClient.delete<void>(`/characters/${id}`);
  },

  async getClothingVariants(characterId: string): Promise<ClothingVariant[]> {
    return httpClient.get<ClothingVariant[]>(`/clothing-variant/character/${characterId}`);
  },

  async createClothingVariant(data: CreateClothingVariantRequest): Promise<ClothingVariant> {
    return httpClient.post<ClothingVariant>('/clothing-variant', data);
  },

  async getWardrobe(characterId: string): Promise<WardrobeItem[]> {
    return httpClient.get<WardrobeItem[]>(`/clothing-variant/wardrobe/${characterId}`);
  },

  async createWardrobeItem(characterId: string, data: CreateWardrobeItemRequest): Promise<WardrobeItem> {
    return httpClient.post<WardrobeItem>('/clothing-variant/wardrobe', { characterId, ...data });
  },

  async deleteWardrobeItem(wardrobeId: string): Promise<void> {
    return httpClient.delete<void>(`/clothing-variant/wardrobe/${wardrobeId}`);
  },

  async createWardrobe(characterId: string, data: CreateWardrobeItemRequest): Promise<WardrobeItem> {
    return httpClient.post<WardrobeItem>(`/characters/${characterId}/wardrobes`, data);
  },
};
